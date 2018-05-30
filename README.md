# UE-CommentsAndRatings
A Generic Comments and Ratings Service

## Description

The Comments and Ratings service allows you to interact with a REST API to create or interact with the following artifacts:

* Targets - An artifact that uniquely represents something against which comments are submitted. This can be a web page, a single object on a screen, or really anything that has a unique identifier relative to your domain. As an additional layer of data organization, targets are classified by a "Type" property which can be configured through the config.js file and deployed with the service. 
* Comments - A comment is a user submitted message that is saved relative to a target.
* Ratings - Ratings are optionally submitted against "Dimensions" which are configured for each potential "Type" of Target within the config.js file and part of the Comment itself. They are actually an array on the Comment data model. The rating is represented as a numerical value with a range also specified in the config file.

### Example

* Target = A User Profile Page
* Type = User (as defined via a property on the Target and Comment models)
* Dimensions = Reliability, Honesty, Fairness
* Rating Range = 1 to 5

In this example, lets say I left a comment for a User named Joe as such:

* Comment = "Joe is great... mostly"
* Reliability = 4
* Honesty = 5
* Fairness = 3

The system would then calculate an overall rating of 4 by averaging the three dimensions. On the UI you might then see the comment, the overall rating, and the individual dimension ratings.

## Rating Calculations

The service calculates individual comment overall ratings on write and update. In the above example, the mongo Comment object will have written the overall_rating value as 4 immediately. The service allows you to see overall ratings at a Target level as well, but these are not written in the DB at any point, they are always calculated on the fly.
This is accomplished by using the MongoDB aggregation model to find and group properties from all Comments associated to a Target. While the service will tell you the total number of comments for a Target, calculations are limited to the last 1000 comments.
From a performance perspective, this is offloading the work from this service to mongo itself; however, it is expected that this data will take more time to serve than simply returning the comment list. Two mechanisms are in place to account for this potential performance issue:

* If you do a GET against the Target, it will return the overall calculations listed here, but not the comments themselves. There is a GET filtered Comments endpoint in the API that will allow you to get these comments immediately upon viewing a target in a UI for example. In this way, you can make the call for all of the Comments to populate the page and make the call for the Target information at the same time, but rest easy knowing that even though the target level ratings may not have rendered yet, all of the comments should be there.
* The GET Target and Comment endpoints are cached for 3 minutes. The upside is that this will be performant in general. The downside is that new comments may not show for 3 minutes.

## Terms

* UEAuth - United Effects LLC is the owner of this code and the service was primarily designed to operate with the [UE Auth](https://ueauth.io) IDM system, a propritary authentication platform. That said, we offer this service as open source so feel free to fork it and add a more standard auth scheme such as OAuth. You'll find the auth functionality is modularized middleware using the Passport.js library and can be swapped out easily.
  * If you do replace the UEAuth implementation, please check deleteComment and putComment in /services/comrate/api.js as both of these functions reference auth.isValidProductAdminOnly, which will need to be removed.
  * Within config.js, there is a reference to the United Effects Domain service under property UEAuth. This is used for token validation in the UEAuth platform. If you replace authentication, this property would not be required.
* UE Roles - UE Auth allows for the concept and management of roles. There are a few standard roles such as Super Admin, Product Admin, Domain Admin and Guest. We manage access based on these roles via middleware. This too can be modified or replaced depending on your needs with minimal change.
* Base Access - Part of the roles system. Usually this will just be guest, but you can define any additional roles that you want to call out for this level of access in config with a comma delimited list (no spaces)
```
    BASE_ACCESS: process.env.BASE_ACCESS || 'guest,other,somethingelse',
```

* Product - The Product, referred to as PRDUCT_SLUG in config.js, is our term for an organization employing this service. It is the highest level hierarchical root of a multi-tenant system where each tenant is defined as a Domain. In UE Auth, we represent this with a unique slug, all lowercase, no special characters, and underscores instead of spaces.
* Domain - Every endpoint in this API references a Domain. Even if you don't use UEAuth, this is still a good practice as it allows a consistent organization of unique targets and access to those targets. As explained above, Domains are tenants of a multi-tenant system and UE Auth restricts access to domains based on user privileges.
* Implementer - Where United Effects LLC is the author, the Implementer is you (whomever you may be). This field is set in the config.js file and allows the generated documentation to reference you.
* Type - We limit the types of Targets and Comments by defining an enum in the config file which limits the Type property in both models.
```
    TARGET_TYPES: ['user', 'property', 'merchant'],
```
* Dimensions - Dimensions are defined by Type in the config. You can define as many as you like.
```
    TARGET_DIMENSIONS: [
        {
            type: 'user',
            dimensions: ['reliability', 'honesty', 'fairness']
        },
        {
            type: 'property',
            dimensions: ['accuracy', 'communication', 'cleanliness', 'location', 'value']
        },
        {
            type: 'merchant',
            dimensions: ['value', 'quality', 'service', 'accuracy']
        }
    ]
```
* Comment Status - Comments can go through a status workflow. This is implemented as little more than a state change property. There is no support for a real workflow here. The possible statuses are limited by an enum defined in config.js
```
    COMMENT_STATUS: ['pending', 'approved', 'rejected'],
```
* Max Possible Rating - All ratings start at 1, but you can define how high they may go in the config. Ratings can be represented as a numerical value at all times, or you may coorelate them to a visual concept like stars on the UI, in which case a limit woudl be advisable.
```
    MAX_POSSIBLE_RATING: 5,
```

## Full Config

/config.js (at the root)

```
{
    ENV: process.env.NODE_ENV || 'dev',
    SWAGGER: process.env.SWAGGER || 'localhost:4040',
    MONGO: process.env.MONGO || 'mongodb://localhost:27017/ue-comment-ratings',
    REPLICA: process.env.REPLICA || 'rs0',
    UEAUTH: process.env.UEAUTH || 'https://domainqa.unitedeffects.com',
    PRODUCT_SLUG: process.env.PRODUCT_SLUG || 'your_product_slug',
    IMPLEMENTER: process.env.IMPLEMENTER || 'United Effects LLC',
    BASE_ACCESS: process.env.BASE_ACCESS || 'guest',
    /**
     * Configure the below for your needs. Each type is a general target for comments. Dimensions allow
     * a granular review.
     */
    COMMENT_STATUS: ['pending', 'approved', 'rejected'],
    COMMENT_DEFAULT_STATUS: 'pending',
    TARGET_TYPES: ['user', 'property', 'merchant'],
    MAX_POSSIBLE_RATING: 5,
    TARGET_DIMENSIONS: [
        {
            type: 'user',
            dimensions: ['reliability', 'honesty', 'fairness']
        },
        {
            type: 'property',
            dimensions: ['accuracy', 'communication', 'cleanliness', 'location', 'value']
        },
        {
            type: 'merchant',
            dimensions: ['value', 'quality', 'service', 'accuracy']
        }
    ]
};

```
## Target Model
```
{
    target_locator: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: config.TARGET_TYPES
    },
    created: {
        type: Date,
        default: moment().format('LLLL')
    },
    domain: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}
```

## Comment Model
```
{
    target_id: {
        type: String,
        required: true,
        index: true
    },
    created: {
        type: Date,
        default: moment().format('LLLL')
    },
    creator: String,
    modified: {
        type: Date,
        default: moment().format('LLLL')
    },
    parent_id: String,
    modified_by: String,
    comment: String,
    domain: {
        type: String,
        required: true
    },
    dimensions: [
        {
            _id: false,
            name: String,
            rating: Number
        }
    ],
    overall_rating: Number,
    status: {
        type: String,
        enum: config.COMMENT_STATUS,
        default: config.COMMENT_DEFAULT_STATUS
    }
}
```
<i>*moment() refers to moment.js which is used in the code</i>

## Docker

This service is fully docker compliant. You'll find the Dockerfile at the root directory.

* docker build -t user/ue-comments-ratings:1.0.0 .
* docker run -p 4040:4040 user/ue-comments-ratings:1.0.0

## Local Install

* cp ./config-changeme.js ./config.js
* Update the config.js file to your needs(i.e. mongo connection, dimensions, etc...)
* yarn
* yarn test (WIP)
* yarn run dev
* https://localhost:4040/api (docs)
* https://localhost:4040/swagger (swagger and testing)

## Work In Progress

* Unit Tests are being built now
