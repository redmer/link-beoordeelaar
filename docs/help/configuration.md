# Configuring `link-beoordeelaar` for your users

This document describes how to prepare `link-beoordeelaar` for your users.

## Deploy `link-beoordeelaar`

This application works statically from `https://rdmr.eu/link-beoordeelaar/`.
Provide your [session key](#generate-session-key) and you can use this website.

You can also deploy the app on your own domain.
Clone [this repository](https://github.com/redmer/link-beoordeelaar) and follow your internal steps to deploy it.

## Session Configuration

### Next-subject filters

ClientSessions can add a `filter` query parameter to the `links.next` URL. The
value is a URL-encoded JSON object that describes which subjects are eligible
to be returned by `/datasets/{dataset}/next-subject`.

The filter supports basic boolean composition and matching against
`metadata.<key>` and `answers.<questionId>` fields.

Supported operators:

- `and` / `or` / `not`
- `eq` (field equals value)
- `contains` (array contains value)
- `exists` (field is defined)

#### Example

"Give me a subject where `q1` is not `delete`, and where not all of the other
answers are already present."

```json
{
  "and": [
    {
      "not": {
        "contains": { "field": "answers.q1", "value": "delete" }
      }
    },
    {
      "not":
        { "exists": { "field": "answers.q2" } },
    ,
        "not":
          { "exists": { "field": "answers.q3" } }

      }

  ]
}
```

URL-encoded (for `?filter=`):

```
%7B%22and%22%3A%5B%7B%22not%22%3A%7B%22contains%22%3A%7B%22field%22%3A%22answers.q1%22%2C%22value%22%3A%22delete%22%7D%7D%7D%2C%7B%22not%22%3A%7B%22and%22%3A%5B%7B%22exists%22%3A%7B%22field%22%3A%22answers.q2%22%7D%7D%2C%7B%22exists%22%3A%7B%22field%22%3A%22answers.q3%22%7D%7D%5D%7D%7D%5D%7D
```

#### Allowed fields

- `id`, `url`
- `metadata.<key>`
- `answers.<questionId>`

#### Exists example

"Give me subjects where any value for `q2` is already present."

```json
{ "exists": { "field": "answers.q2" } }
```

## Generate Session Key

Once you have deployed the [session configuration](#session-configuration) somewhere your users' webbrowser may find it, you can generate the session key.

The session key is the Base64-encoded (URI-safe) representation of the URL to the session configuration JSON.

> **Example**
>
> If the JSON file is hosted at `https://example.org/data.json`, the key can be generated on the command line interface:
>
> ```bash
> $ echo -n "https://example.org/data.json" | base64
> aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24=
> ```
>
> Your session key is this code, without the last one or two `=` signs.
> Other programming languages and online services also provide Base64 encoding.

Send your session key to your users by appending it to the deployed website, `?session=` and the session key.

> **Example**
>
> - `https://rdmr.eu/link-beoordeelaar/?session=aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24`
> - `https://example.org/link-beoordeelaar?session=aHR0cHM6Ly9leGFtcGxlLm9yZy9kYXRhLmpzb24`

## Help

If you need further support, open a ticket at [GitHub](https://github.com/redmer/link-beoordeelaar).
Those are handled without warranty.
