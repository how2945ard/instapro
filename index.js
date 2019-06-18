const BlueBird = require('bluebird');
const bluebirdRetry = require('bluebird-retry');

const _ = require('lodash');

const request = BlueBird.promisifyAll(require('request'));
const urlencode = require('urlencode');

const cheerio = require('cheerio');

const cookie = 'ig_pr=2';

exports.getUserByUsername = username => bluebirdRetry(
  () => (
    request.getAsync({ url: `http://www.instagram.com/${urlencode(username)}`, json: true })
      .then(({ body }) => {
        const $ = cheerio.load(body);
        let user = {};
        let eleHTML = '';
        $('body').children().each((i, e) => {
          eleHTML = $(e).html();
          const htmlContent = eleHTML.split('"ProfilePage":[')[1];
          if (eleHTML.indexOf('window._sharedData') > -1 && htmlContent) {
            user = _.get(JSON.parse(htmlContent.split(']},"hostname"')[0]), 'graphql.user');
          }
        });
        return user;
      })
  ), {
    max_tries: 3,
    throw_original: true,
    interval: 1000,
    backoff: 2,
  },
);

exports.getUserIdFromUsername = username => bluebirdRetry(
  () => (
    request.getAsync({ url: `http://www.instagram.com/${urlencode(username)}`, json: true })
      .then(({ body }) => {
        const $ = cheerio.load(body);
        let user = {};
        let eleHTML = '';
        $('body').children().each((i, e) => {
          eleHTML = $(e).html();
          const htmlContent = eleHTML.split('"ProfilePage":[')[1];
          if (eleHTML.indexOf('window._sharedData') > -1 && htmlContent) {
            user = _.get(JSON.parse(htmlContent.split(']},"hostname"')[0]), 'graphql.user.id');
          }
        });
        return user;
      })
  ), {
    max_tries: 3,
    throw_original: true,
    interval: 1000,
    backoff: 2,
  },
);

exports.getMediaByCode = shortcode =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.graphql;
      })
      .catch(error => error)
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });

exports.getMediaCommentsByCode = shortcode =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.graphql.shortcode_media.edge_media_to_comment || body.graphql.shortcode_media.edge_media_to_parent_comment;
      })
      .catch(error => error)
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });

exports.getUsenameFromUserID = userID =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://i.instagram.com/api/v1/users/${userID}/info/`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.user;
      })
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });

exports.getTaggedUsersByCode = shortcode =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.graphql.shortcode_media.edge_media_to_tagged_user;
      })
      .catch(error => error)
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });


exports.getMediaLikesByCode = shortcode => bluebirdRetry(() => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      return body.graphql.shortcode_media.edge_media_preview_like;
    })
    .catch(error => error)
), {
    max_tries: 3,
    throw_original: true,
    interval: 1000,
    backoff: 2,
  });


exports.getMediaOwnerByCode = shortcode => bluebirdRetry(() => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      return body.graphql.shortcode_media.owner;
    })
    .catch(error => error)
), {
    max_tries: 3,
    throw_original: true,
    interval: 1000,
    backoff: 2,
  });


exports.getMediaByLocation = (locationId, maxId = '') =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/explore/locations/${locationId}/?__a=1&max_id=${maxId}`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.graphql;
      })
      .catch(error => error)
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });


exports.getHashInfoByTag = (tag, maxId = '') =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/explore/tags/${urlencode(tag)}/?__a=1&max_id=${maxId}`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body.graphql;
      })
      .catch(error => error)
  ), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    });


exports.generalSearch = query =>
  bluebirdRetry(() => (
    request.getAsync({ url: `https://www.instagram.com/web/search/topsearch/?query=${urlencode(query)}`, json: true })
      .then(({ body }) => {
        if (body === 'Oops, an error occurred.\n') {
          throw new APIError('Oops, an error occurred.');
        }
        return body;
      })
      .catch(error => error), {
      max_tries: 3,
      throw_original: true,
      interval: 1000,
      backoff: 2,
    })
  )

