import db from './config/db';
import { getParent } from './common';

const { Docset, Doc, Language, Version } = db.models;

export function * postDoc () {
  const { slug, body, description } = this.request.body;
  const { docset, category } = this.params;
  const lang = this.headers['accept-language'];

  yield getParent;

  const docCategory = yield Doc.findOne({
    where: { slug: category, category_id: null },
    include: [{
      model: Docset,
      attributes: ['slug'],
      where: { slug: docset }
    }]
  });

  const newDoc = yield Doc.create({
    slug
  })
  .catch(error => {
    if (error.errors[0].type.includes('notNull Violation')) {
      this.throw(400, JSON.stringify({ name: 'Name cannot be blank.' }));
    }
  });

  if (this.parent) {
    yield this.parent.addChild(newDoc);
  } else if (docCategory) {
    yield docCategory.addChild(newDoc);
  } else {
    this.status = 401;
    this.body = `Can't find that category.`;
  }

  try {
    yield newDoc.setCategory(docCategory);
  } catch (error) {
    if (error.errors[0].type.includes('unique violation')) {
      newDoc.destroy();
      this.status = 401;
      this.body = error.errors[0].path === 'slug' ? { name: 'Doc name taken.' } : { unknown: 'Doc not unique.' };
      return;
    }
  }

  /* Posts a doc or, if there's a `body` is included, posts a doc and post a version along with it. */
  if (!body) {
    this.status = 200;
    this.body = {
      data: newDoc
    };
  } else {
    const language = yield Language.findOne({ where:
      { slug: { ilike: lang } }
    });

    const version = yield Version.create({
      description,
      body
    });

    yield version.setDoc(newDoc);
    yield version.setUser(this.user.id);
    yield version.setLanguage(language);

    yield newDoc.addVersion(version)
    .then(() => {
      this.status = 200;
      this.body = {
        data: version
      };
    })
    .catch(() => {
      this.throw(400, 'PROBLEM_POSTING_PART');
    });
  }
}

export function * getDocs () {
  const { docset, category } = this.params;
  const { parent, levels } = this.request.query;

  const parentQuery = parent ? {
    model: Doc,
    as: 'parent',
    where: { slug: parent }
  } : {};

  const docsetQuery = {
    model: Doc,
    as: 'category',
    attributes: ['slug'],
    where: category ? { slug: category } : {},
    include: [{
      attributes: ['slug'],
      model: Docset,
      where: {
        slug: docset
      }
    }]
  };

  const query = parent ? {
    include: [docsetQuery, parentQuery]
  } : { include: docsetQuery };

  const where = (levels === 'top') ? {
    where: { parent_id: null }
  } : {};

  yield Doc.findAndCountAll({
    ...where,
    attributes: ['slug'],
    ...query,
    order: [
      ['slug', 'ASC']
    ]
  })
  .then(result => {
    this.status = 200;
    this.body = {
      meta: {
        count: result.count
      },
      data: result.rows
    };
  })
  .catch(error => {
    console.error(error);
    this.throw(400, 'PROBLEM_GETTING_DOCSET_PARTS');
  });
}

export function * getDoc () {
  const { docset, slug, category } = this.params;
  const lang = this.headers['accept-language'];

  const version = yield Version.findAll({
    limit: 1,
    include: [{
      model: Language,
      where: { slug: { ilike: lang } }
    }, {
      model: Doc,
      where: { slug: { ilike: slug } },
      attributes: ['slug'],
      include: [{
        model: Doc,
        as: 'category',
        where: { slug: category },
        attributes: ['slug'],
        include: [{
          model: Docset,
          where: { slug: docset },
          attributes: ['slug']
        }]
      }, {
        model: Doc,
        as: 'parent',
        attributes: ['slug']
      }]
    }],
    order: [['createdAt', 'DESC']]
  });

  if (version) {
    this.status = 200;
    this.body = {
      data: version[0] || { body: {} }
    };
  } else {
    this.throw(400, 'CANT_FIND_PART');
  }
}

export function * getSearchDoc () {
  const { search, docset } = this.params;

  const results = yield Doc.findAndCountAll({
    where: { slug: { ilike: '%' + search + '%' } },
    limit: 40,
    include: {
      model: Doc,
      as: 'category',
      attributes: ['slug', 'id'],
      include: {
        model: Docset,
        attributes: ['slug'],
        where: { slug: { ilike: docset } }
      }
    }
  });

  if (results) {
    this.status = 200;
    this.body = {
      meta: {
        count: results.count,
        term: search
      },
      data: results.rows
    };
  } else {
    this.status = 400;
    this.body = 'NO_RESULTS';
  }
}

export function * postCategory () {
  const { docset } = this.params;
  const { slug } = this.request.body;

  const typeDocset = yield Docset.findOne({
    where: { slug: docset }
  });

  if (!typeDocset) this.throw(400, 'CANT_FIND_DOCSET');

  const category = yield Doc.create({
    slug
  });

  if (category) {
    yield category.setDocset(typeDocset)
    .then(() => {
      this.status = 200;
      this.body = category;
    })
    .catch(error => {
      console.log(error);
      if (error.errors[0].type.includes('unique violation')) {
        this.throw(400, 'NOT_UNIQUE');
      }
    });
  }
}

export function * getCategories () {
  const { docset } = this.params;

  const categories = yield Doc.findAndCountAll({
    where: { category_id: null },
    include: {
      model: Docset,
      attributes: ['slug'],
      where: { slug: docset }
    }
  });

  if (categories) {
    this.status = 200;
    this.body = {
      meta: { count: categories.count },
      data: categories.rows
    };
  } else {
    this.throw(400, 'NO_CATEGORIES');
  }
}

export function * getCategory () {
  const { docset, category } = this.params;
  const lang = this.headers['accept-language'];

  const version = yield Version.findAll({
    limit: 1,
    include: [{
      model: Language,
      where: { slug: { ilike: lang } }
    }, {
      model: Doc,
      where: { slug: { ilike: category }, category_id: null },
      attributes: ['slug'],
      include: [{
        model: Docset,
        where: { slug: docset },
        attributes: ['slug']
      }]
    }],
    order: [['createdAt', 'DESC']]
  });

  if (version) {
    this.status = 200;
    this.body = {
      data: version[0] || {
        body: {
          description: '',
          name: category,
        }
      }
    };
  } else {
    this.throw(400, 'CANT_FIND_PART');
  }
}
