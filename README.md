# kudos

Remix-prisma-mongodb-google drive APIs

## .env file example

```
DATABASE_URL="mongodb+srv://<username>:<password>@kudos.nq6knox.mongodb.net/?retryWrites=true&w=majority"
SESSION_SECRET="YOUR_SESSION_SECRET"
GOOGLE_DRIVE_PROJECT_ID=""
GOOGLE_DRIVE_FOLDER_ID=""
GOOGLE_DRIVE_PRIVATE_KEY_ID=""
GOOGLE_API_WEB_CREDENTIAL=""
```

How to get `DATABASE_URL`: Create mongodb account in https://cloud.mongodb.com/ , create kudos project then connect to your project as guided from the website.

To use Google Drive API. You'll need a google cloud project and a google service account.

1. Create a project on https://console.cloud.google.com - let's call the project kudos
2. To get `GOOGLE_DRIVE_PROJECT_ID`, select Kudos (project name) from the navigation bar, It'll show the project id next to the project name.
3. To get `GOOGLE_DRIVE_FOLDER_ID`, create a folder for Kudos project on your Google Drive account. When navigate to that folder, in the url, you'll get the `GOOGLE_DRIVE_FOLDER_ID`. example: https://drive.google.com/drive/u/0/folders/<GOOGLE_DRIVE_FOLDER_ID>
4. You'll need a service account to handle the image upload feature on Google Drive. Follow this guide to create a Google Service Account, and create a key to access Kudos Project. https://developers.google.com/identity/protocols/oauth2/service-account#creatinganaccount. After creating a key for service account, you'll get a .JSON file similar to this:

```
  {
    "type": "service_account",
    "project_id": "",
    "private_key_id": "",
    "private_key": "",
    "client_email": "",
    "client_id": "",
    "auth_uri": "",
    "token_uri": "",
    "auth_provider_x509_cert_url": "",
    "client_x509_cert_url": "",
    "universe_domain": ""
  }
```

5. Insert the object to GoogleAPIsCredential table on Mongodb as we'll use this to retrieve the Google API Token.
6. To get `GOOGLE_DRIVE_PRIVATE_KEY_ID`, use the value of `private_key_id` from .JSON file in step 4.
7. To get `GOOGLE_API_WEB_CREDENTIAL`, go to https://console.cloud.google.com -> select Kudos project, on the left panel, select Enabled APIs & services. -> scroll down to Google Drive API and enable it. After that, go to CREDENTIALS section, -> + CREATE CREDENTIALS -> OAuth client ID. Then fill the form like this:

```
  Application type* : Web application
  Name*: Kudos Auth Client (your choice)
```

7. Then press on create button. Under OAuth 2.0 Client IDs, you'll see your new Auth Client record. Under the Actions column, Download Oauth client as a .JSON file. Then stringify that JSON and paste it into `GOOGLE_API_WEB_CREDENTIAL` in .env file.

## Development

To run your Remix app locally, make sure your project's local dependencies are installed:

```sh
npm install
```

Afterwards, start the Remix development server like so:

```sh
npm run dev
```

Open up [http://localhost:3000](http://localhost:3000) and you should be ready to go!

Note: If you want to update ORM in prisma/schema.prisma, make sure to run this command after to get the new type checking for your ORM.

```sh
npx prisma db push
```
