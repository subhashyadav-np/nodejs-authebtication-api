# nodejs-authebtication-api

A complete nodejs user authentication api ( Login / Register / Logout / AuthenticatedAPI ) from scratch using expressjs, mongoose, jsonwebtoken, bcryptjs


## Practice_Login_Register_Using_This_API
https://jcimipr4qj.execute-api.us-east-2.amazonaws.com/   


## For_User_Registration

post /api/user/register  
'fullName', 'username', 'email', 'password', 'confirmPassword'

## For_User_Login

post /api/user/login  
'username', 'password'

## For_User_Logout

get /api/user/logout  
'auth_token' in headers

## For_Authenticated_APIs

get /api/user/dashboard  
'auth_token' in headers
