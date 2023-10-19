import React from 'react'
import Heading from '../../components/heading'
import { AssetCategories } from '../../hooks/useDatabaseQuery'
import { Platforms, sortableFieldMap } from '../query'

const QueryCheatsheet = () => {
  return (
    <>
      <Heading variant="h1">Query Cheatsheet</Heading>
      <p>
        The query system on this site is based on the "booru" style of tags like{' '}
        <a href="https://safebooru.org/index.php?page=help&topic=cheatsheet">
          this
        </a>
        :
      </p>
      <p>
        <strong>tag1 tag2</strong>
        <br />
        Search for assets that have tag1 and tag2.
      </p>
      <p>
        <strong>~tag1 ~tag2</strong>
        <br />
        Search for assets that have tag1 or tag2.
      </p>
      <p>
        <strong>-tag1</strong>
        <br />
        Search for assets that don't have tag1.
      </p>
      {/* <p>
        <strong>ta*1</strong>
        <br />
        Search for assets with tags that starts with ta and ends with 1.
      </p> */}
      <p>
        <strong>user:Bob</strong>
        <br />
        Search for assets posted by the user Bob. Case sensitive. Wrap usernames
        with spaces with " eg. "My Name".
      </p>
      <p>
        <strong>author:Bob</strong>
        <br />
        Search for assets by the author Bob. Case sensitive. Wrap names with
        spaces with " eg. "My Name".
      </p>
      {/* <p>
        <strong>approved:bob</strong>
        <br />
        Search for assets approved by the editor Bob.
      </p> */}
      <p>
        <strong>category:{AssetCategories.avatar}</strong>
        <br />
        Search for assets by the category "{AssetCategories.avatar}". Other
        categories: {Object.values(AssetCategories).join(', ')}
      </p>
      <p>
        <strong>species:Dogs</strong>
        <br />
        Search for assets that contains the species "Dogs". Plural only. Case
        sensitive. Uses any name on our species page.
      </p>
      <p>
        <strong>source:*myuser.gumroad*</strong>
        <br />
        Search for assets that have a source URL that contains a phrase
      </p>
      {/* <p>
        <strong>parent:ae3f3dfb-ee93-4b69-a245-cee66ef111fa</strong>
        <br />
        Search for assets that have the provided asset as a parent. Can provide
        the slug (the part of the URL that starts with 5 random symbols eg.
        "gsew3-my-cool-asset")
      </p> */}
      <p>
        <strong>sort:created:desc</strong>
        <br />
        Sort assets by when they were created (asc or desc). All sortable
        fields: {Object.keys(sortableFieldMap).join(', ')}
      </p>
    </>
  )
}

export default QueryCheatsheet
