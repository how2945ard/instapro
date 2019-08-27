function createErrorClass(name, init) {
  function Err(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message;
    return init && init.apply(this, arguments);//  eslint-disable-line
  }
  Err.prototype = new Error();
  Err.prototype.name = name;
  Err.prototype.constructor = Err;
  return Err;
}
global.APIError = createErrorClass(
  'APIError',
  function APIError(message) {
    this.message = `APIError ${message}`;
  },
);
global.UnexpectedResponseStructure = createErrorClass(
  'UnexpectedResponseStructure',
  function UnexpectedResponseStructure(message) {
    this.message = `UnexpectedResponseStructure ${message}`;
  },
);

const BlueBird = require('bluebird');
const bluebirdRetry = require('bluebird-retry');

const _ = require('lodash');

const request = BlueBird.promisifyAll(require('request'));
const urlencode = require('urlencode');

const cheerio = require('cheerio');

const cookie = 'ig_pr=2';

const getUserByUsername = exports.getUserByUsername = ({ username, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `http://www.instagram.com/${urlencode(username)}`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(({ body }) => {
      const $ = cheerio.load(body);
      let user = {};
      let eleHTML = '';
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      $('body').children().each((i, e) => {
        eleHTML = $(e).html();
        const htmlContent = eleHTML.split('"ProfilePage":[')[1];
        if (eleHTML.indexOf('window._sharedData') > -1 && htmlContent) {
          user = _.get(JSON.parse(htmlContent.split(']},"hostname"')[0]), 'graphql.user');
        }
      });
      if (_.isEmpty(user)) {
        throw new APIError(`Empty user object ${JSON.stringify(user)}`)
      }
      return user;
    })

exports.getMediaByCode = ({ shortcode, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getMediaByCode - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getMediaCommentsByCode = ({ shortcode, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql.shortcode_media.edge_media_to_comment') || _.get(body, 'graphql.shortcode_media.edge_media_to_parent_comment');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getMediaCommentsByCode - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getUsernameFromUserID = ({ userID, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://i.instagram.com/api/v1/users/${userID}/info/`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'user');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getUsernameFromUserID - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getTaggedUsersByCode = ({ shortcode, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql.shortcode_media.edge_media_to_tagged_user');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getTaggedUsersByCode - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getMediaLikesByCode = ({ shortcode, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql.shortcode_media.edge_media_preview_like');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getMediaLikesByCode - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getMediaOwnerByCode = ({ shortcode, proxy }) =>
  request.getAsync(
    _.omitBy(
      { url: `https://www.instagram.com/p/${shortcode}/?__a=1`, json: true, proxy: proxy },
      x => x === null || x === undefined)
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql.shortcode_media.owner');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getMediaOwnerByCode - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getMediaByLocation = ({ locationId, maxId = '', proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/explore/locations/${locationId}/?__a=1&max_id=${maxId}`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getMediaByLocation - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.getHashInfoByTag = ({ tag, maxId = '', proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/explore/tags/${urlencode(tag)}/?__a=1&max_id=${maxId}`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(async ({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      const response = _.get(body, 'graphql');
      if (response) {
        return response;
      }
      if (
        _.includes(JSON.stringify(body), 'Sorry, this page isn&#39;t available.') ||
        _.includes(JSON.stringify(body), 'Page Not Found')
      ) {
        return null;
      }
      if (_.includes(JSON.stringify(body), 'Please wait a few minutes before you try again.')) {
        console.log('Delaying request for 5 seconds')
        await BlueBird.delay(5000);
      }

      console.error(`getHashInfoByTag - Unexpected response body ${JSON.stringify(body)}`)
      throw new UnexpectedResponseStructure(`Unexpected response body ${JSON.stringify(body)}`);
    })

exports.generalSearch = ({ query, proxy }) =>
  request.getAsync(
    _.omitBy({ url: `https://www.instagram.com/web/search/topsearch/?query=${urlencode(query)}`, json: true, proxy: proxy },
      x => x === null || x === undefined
    )
  )
    .then(({ body }) => {
      if (body === 'Oops, an error occurred.\n') {
        throw new APIError('Oops, an error occurred.');
      }
      return body;
    })