const BlueBird = require('bluebird')
const request = BlueBird.promisifyAll(require('request'));
const urlencode = require('urlencode');

const cheerio = require('cheerio');

const cookie = 'ig_pr=2';

exports.getUserByUsername = username => (
  request.getAsync({ url: `http://www.instagram.com/${urlencode(username)}`, json: true })
    .then(({ body }) => {
      const $ = cheerio.load(body);
      let user = {};
      let eleHTML = '';
      $('body').children().each((i, e) => {
        eleHTML = $(e).html();
        const htmlContent = eleHTML.split('"ProfilePage":[')[1];
        if (eleHTML.indexOf('window._sharedData') > -1 && htmlContent) {
          user = JSON.parse(htmlContent.split(']},"hostname"')[0]).graphql.user;
        }
      });
      return user;
    })
);

exports.getUserIdFromUsername = username => (
  request.getAsync({ url: `http://www.instagram.com/${urlencode(username)}`, json: true })
    .then(({ body }) => {
      const $ = cheerio.load(body);
      let user = {};
      let eleHTML = '';
      $('body').children().each((i, e) => {
        eleHTML = $(e).html();
        const htmlContent = eleHTML.split('"ProfilePage":[')[1];
        if (eleHTML.indexOf('window._sharedData') > -1 && htmlContent) {
          user = JSON.parse(htmlContent.split(']},"hostname"')[0]).graphql.user.id;
        }
      });
      return user;
    })
);

exports.getUsenameFromUserID = userID => (
    request.getAsync({ url: `https://i.instagram.com/api/v1/users/${userID}/info/`, json: true })
      .then(({body}) => {
        return body.user;
      })
  );

exports.getMediaByCode = shortcode => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => body.graphql)
    .catch(error => error)
);

exports.getMediaCommentsByCode = shortcode => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => body.graphql.shortcode_media.edge_media_to_comment)
    .catch(error => error)
);

exports.getTaggedUsersByCode = shortcode => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => body.graphql.shortcode_media.edge_media_to_tagged_user)
    .catch(error => error)
);

exports.getMediaLikesByCode = shortcode => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => body.graphql.shortcode_media.edge_media_preview_like)
    .catch(error => error)
);

exports.getMediaOwnerByCode = shortcode => (
  request.getAsync({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true })
    .then(({ body }) => body.graphql.shortcode_media.owner)
    .catch(error => error)
);

exports.getMediaByLocation = (locationId, maxId = '') => (
  request.getAsync({ url: `https://www.instagram.com/explore/locations/${locationId}/?__a=1&max_id=${maxId}`, json: true })
    .then(({ body }) => body.graphql)
    .catch(error => error)
);

exports.getHashInfoByTag = (tag, maxId = '') => (
  request.getAsync({ url: `https://www.instagram.com/explore/tags/${urlencode(tag)}/?__a=1&max_id=${maxId}`, json: true })
    .then(({ body }) => body.graphql)
    .catch(error => error)
);

exports.generalSearch = query => (
  request.getAsync({ url: `https://www.instagram.com/web/search/topsearch/?query=${urlencode(query)}`, json: true })
    .then(({ body }) => body))
  .catch(error => error);
