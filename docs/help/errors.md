# List of errors

This document lists the error codes the application can generate.
Users may give you one of these codes, so you may use this document to help them get back on track.

#### `dfc29c07-4fc7-41f7-9d56-8db988573511`

The user does not have JavaScript turned on. This error is shown by the browser's `<noscript>` tag.

Solution: turn on JavaScript in a modern browser.

#### `1753c02d-503b-4422-8a5e-2e8464cadf17`

No session key found in query parameters.

Solution: [provide session key](configuration.md) in query parameter: `?session=`.

#### `c0095f9e-f9cb-4cbc-aefd-d88ef94e5e37`

This error is caused by one of the following:

1. No session JSON could be found at the specified location
1. The session JSON at the specified location could not be parsed

Solution: check that your users' browsers can acess the JSON and check the welformedness of the JSON file.
