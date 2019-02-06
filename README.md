# My Education App Capstone API

Thinkful (https://www.thinkful.com/) React Capstone Project providing API service to manage view and rate educational tools for children.

####Link to the API server:	
	Github: https://debrashere.github.io/MyEducationServer/
	Heroku: https://myeducationserver.herokuapp.com/api/users

 
####What you can do: 
    Retrieve educational tools and blogging data.

## Working with MyEducationServer API

###Retrieving a list of educational tools
You can retrieve a list of educational tools. The URI for a tools request has the following format: Authentication is required, example has the test token.

 
https://myeducationserver.herokuapp.com/api/tools

####Request
```
Test Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiYXNhbmRlcnMiLCJmaXJzdE5hbWUiOiJhbm4iLCJsYXN0TmFtZSI6InNhbmRlcnMifSwiaWF0IjoxNTQ5NDE2NDg4LCJleHAiOjE1NTAwMjEyODgsInN1YiI6ImFzYW5kZXJzIn0.sZuOkXXdZCe6bplTLJVciDVDm73eex-ystJE09Tf0Zw

GET https://myeducationserver.herokuapp.com/api/tools

 Code
  fetch(`${API_BASE_URL}/tools`, {
            method: 'GET',
            headers: {
                // Provide our auth token as credentials
                Authorization: `Bearer ${authToken}`
            }
```

####Response
```
    If the request succeeds, the server responds with an HTTP 201 OK status code and the tools data:
  [   
    {
        "id": "5c59230e83a0a11290d0e4a2",
        "title": "Koch, MacGyver and DuBuque",
        "url": "https://ladarius.com3",
        "description": "Et dolorem nihil blanditiis cumque accusamus. Eius voluptates in omnis sit. Nemo impedit tempore porro et quia saepe.",
        "price": 65.5,
        "rating": 5
    },
    {
        "id": "5c59230e83a0a11290d0e4a1",
        "title": "Padberg Inc",
        "url": "http://anita.biz2",
        "description": "Harum quisquam asperiores rerum consectetur. Voluptas labore ullam reprehenderit et maiores dolorum. Ullam quas vel quam nihil ullam ut fugiat voluptates. Molestiae voluptate et asperiores odio amet. Assumenda omnis aut magnam cumque voluptates consectetur hic laudantium.",
        "price": 33.1,
        "rating": 5
    },
    {
        "id": "5c59230e83a0a11290d0e49f",
        "title": "Lind Group",
        "url": "http://carolanne.biz0",
        "description": "Dolore mollitia blanditiis est impedit. Eligendi eum nisi nemo quibusdam dicta. Illum in temporibus veritatis. Quod repellendus et omnis sequi sapiente sequi provident nam.",
        "price": 12.6,
        "rating": 2
    }
  ]
  ```

#### Retrieving a specific educational tool
You can retrieve information for a particular tool by sending an HTTP GET request to the tools URI. The URI for a tool has the following format:

https://myeducationserver.herokuapp.com/api/tools/id

#### Request

```
GET https://myeducationserver.herokuapp.com/api/tools/5c59230e83a0a11290d0e4a2

 Code
  fetch'https://myeducationserver.herokuapp.com/api/tools/tools/5c59230e83a0a11290d0e4a2', {
            method: 'GET',
            headers: {
                // Provide our auth token as credentials
                Authorization: `Bearer ${authToken}`
            } 

```
#### Response
If the request succeeds, the server responds with an HTTP 200 OK status code and the tool data:

```
{
    "id": "5c59230e83a0a11290d0e4a2",
    
"title": "Koch, MacGyver and DuBuque",
    
"url": "https://ladarius.com3",
    
"description": "Et dolorem nihil blanditiis cumque accusamus. Eius voluptates in omnis sit. Nemo impedit tempore porro et quia saepe.",
    
"price": 65.5,
    
"rating": 5
}
```

### Retrieving a list of blogs
You can retrieve a list of blogs. The URI for a tools request has the following format: Authentication is required, example has the test token.

https://myeducationserver.herokuapp.com/api/tools

#### Request
```
Test Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJuYW1lIjoiYXNhbmRlcnMiLCJmaXJzdE5hbWUiOiJhbm4iLCJsYXN0TmFtZSI6InNhbmRlcnMifSwiaWF0IjoxNTQ5NDE2NDg4LCJleHAiOjE1NTAwMjEyODgsInN1YiI6ImFzYW5kZXJzIn0.sZuOkXXdZCe6bplTLJVciDVDm73eex-ystJE09Tf0Zw

GET https://myeducationserver.herokuapp.com/api/blogs

 Code
  fetch(`${API_BASE_URL}/blogs`, {
            method: 'GET',
            headers: {
                // Provide our auth token as credentials
                Authorization: `Bearer ${authToken}`
            }

```

#### Response
    If the request succeeds, the server responds with an HTTP 201 OK status code and the tools data:

```
  [
    {
        "id": "5c59231183a0a11290d0e664",
        "toolId": {
            "_id": "5c59230f83a0a11290d0e609",
            "title": "Rutherford - Schimmel",
            "url": "http://ciara.org14",
            "description": "In deserunt quidem architecto dolorum magnam voluptatum libero repellat aliquam. Consequatur et est est omnis doloremque quas. Laboriosam est eum officia ut quia delectus aut non. Alias quas vel facere placeat consectetur voluptatem est.",
            "price": 46.3,
            "rating": 4,
            "__v": 0
        },
        "comments": [
            {
                "_id": "5c59231183a0a11290d0e668",
                "author": "Gaston_Schmitt",
                "content": "Ipsam neque in illo numquam consequatur quae. Ut molestiae repudiandae. Officia est dignissimos praesentium ut nemo quos qui."
            },
            {
                "_id": "5c59231183a0a11290d0e667",
                "author": "Judge_Bailey70",
                "content": "Vitae qui labore illum expedita in ipsa quasi. Qui perspiciatis aliquid consequatur voluptatem enim. Et quo quos at animi voluptas consequuntur pariatur eos."
            },
           
        ]
    ]
```

#### Retrieving a specific tool blog
You can retrieve information for a particular tool's blog data by sending an HTTP GET request to the blog's URI. The URI for a blog has the following format:

 
https://myeducationserver.herokuapp.com/api/blogs/id

#### Request

```
GET https://myeducationserver.herokuapp.com/api/blogs/5c59230e83a0a11290d0e4ae

 Code
  fetch('https://myeducationserver.herokuapp.com/api/blogs/5c59230e83a0a11290d0e4ae', {
            method: 'GET',
            headers: {
                // Provide our auth token as credentials
                Authorization: `Bearer ${authToken}`
            }
```


 
#### Response

If the request succeeds, the server responds with an HTTP 200 OK status code and the blog data:

```
 {
        "id": "5c59231183a0a11290d0e669",
        "toolId": {
            "_id": "5c59230e83a0a11290d0e4ae",
            "title": "Schowalter - Bartell",
            "url": "https://madyson.info15",
            "description": "Et quia iste pariatur et sed pariatur. Illo officia repellendus consectetur nulla accusamus voluptatem optio.",
            "price": 16.7,
            "rating": 3,
            "__v": 0
        },
        "comments": [
            {
                "_id": "5c59231183a0a11290d0e66f",
                "author": "Jacklyn8",
                "content": "Aut ullam aut. Magni dolorum laudantium."
            },
            {
                "_id": "5c59231183a0a11290d0e66e",
                "author": "Eli12",
                "content": "Aperiam exercitationem porro aut optio quos quis. Dignissimos eaque et consequatur qui aspernatur et. Nostrum fugiat atque ut dignissimos explicabo sunt optio quo. Excepturi facere vel officiis. Necessitatibus et aut asperiores delectus omnis. Eos recusandae qui corporis omnis voluptate quae dolor."
            }            
        ]
    }
]
 ```

## Versioning

 [Github](https://github.com/) is used for versioning.

## Authors

* **Debra Odom** - *Initial work* 