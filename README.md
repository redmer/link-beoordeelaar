# link-beoordeelaar

This static web page / application provides an interface to judge URLs. A data provider (JSON-file) describes subjects, answer options and how reporting should be done.

## Input data

### Subjects

Each subject is like a row in a big table. You MUST provide at least the column `url` that contains the URL to be judged. This colums SHOULD have no duplicates.

Other column names are reported in the interface in a table, useful to provide context to the URL to be judged. You MAY limit this list with `keys`.

### Answer Options

Each answer option has a `name` -- that is the option itself. Optionally, each also has a human-readable `description` and a computer-readable `value`. If no `value` is provided, the `value` shall be a slugified version of the name.

### Reporting

By default, the answers to the survey are collected and presented in a textbox at the end of the survey. The user needs to copy the result and send it to the specified e-mail address. This gives the recipient insight into who submitted the judgments and when. It also requires zero backend changes.

An alternative options is a HTTP POST-request to a certain REST endpoint. The payload schema is described in [link-beoordeelaar.json](schema/link-beoordeelaar.json). You MAY limit the keys provided with
