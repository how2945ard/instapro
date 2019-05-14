

const {
    getUserByUsername,
    getUserIdFromUsername,
    getMediaByCode,
    getMediaCommentsByCode,
    getTaggedUsersByCode,
    getMediaLikesByCode,
    getMediaOwnerByCode,
    getMediaByLocation,
    getHashInfoByTag,
    generalSearch,
} = require('./index');

getUserByUsername('instagram').then((user) => {
    console.log(JSON.stringify(user, null, 2))
})

getUserIdFromUsername('instagram').then((id) => {
    console.log(id)
})

getMediaByCode('BUu14BdBkO5').then(media => {
    console.log(media)
})

getMediaOwnerByCode('BUu14BdBkO5').then(media => {
    console.log(media)
})

getMediaByLocation('292188415').then(({ location }) => {
    console.log(location.id)
    console.log(location.name)
    console.log(location.slug)
})

generalSearch('insta').then((results) => {
    console.log(results)
})

getMediaLikesByCode('BUu14BdBkO5').then((media) => {
    console.log(media)
})

getHashInfoByTag('ig').then((media) => {
    console.log(media)
})

getMediaCommentsByCode('BUu14BdBkO5').then((media) => {
    console.log(media)
})

getTaggedUsersByCode('BUu14BdBkO5').then((media) => {
    console.log(media)
})