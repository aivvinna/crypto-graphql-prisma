let users = [{
  id: '1',
  username: 'Bob',
  email: 'bob@gmail.com',
  age: 30
}, {
  id: '2',
  username: 'James',
  email: 'james@gmail.com'
}, {
  id: '3',
  username: 'Mike',
  email: 'mike@gmail.com'
}]

let posts = [{
  id: '1',
  title: 'a post title',
  body: 'a post body',
  published: true,
  author: '1'
}, {
  id: '2',
  title: 'another post title',
  body: 'another post body',
  published: false,
  author: '1'
}, {
  id: '3',
  title: 'wwwwweeeeeee',
  body: 'wzzx',
  published: true,
  author: '2'
}]

let comments = [{
  id: '1',
  text: 'hahaha',
  author: '1',
  post: '3'
}, {
  id: '2',
  text: 'asdfasdf',
  author: '1',
  post: '2'
}, {
  id: '3',
  text: 'aewgrr',
  author: '2',
  post: '3'
}, {
  id: '4',
  text: 'sebrebrb',
  author: '3',
  post: '1'
}]

const db = {
  users,
  posts,
  comments
}

export { db as default } 