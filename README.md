# nodejs-authebtication-api
A complete nodejs user authentication api (Login/Register/Logout/AuthenticatedAPI) from scratch


## For_User_Registration
post /user/register   
'fullName', 'username', 'email', 'password', 'confirmPassword'

## For_User_Login
post user/login   
'username', 'password'

## For_User_Logout
get /user/logout   
'auth_token' in headers

## For_Authenticated_APIs
get user/dashboard   
'auth_token' in headers
