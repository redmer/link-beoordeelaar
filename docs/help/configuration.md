# Configuring `link-beoordeelaar` for your users

This document describes how to prepare `link-beoordeelaar` for your users.

## Deploy `link-beoordeelaar`

This application works statically from `https://rdmr.eu/link-beoordeelaar/`.
Provide your [session key](#generate-session-key) and you can use this website.

You can also deploy the app on your own domain.
Clone [this repository](https://github.com/redmer/link-beoordeelaar) and follow your internal steps to deploy it.

## Session Configuration

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
