import React from "react"
import { useQuery, useMutation } from "@apollo/client"
import gql from "graphql-tag"

import Layout from "../components/layout"
import ItemContainer from "../components/ItemContainer"

const GET_LINKS = gql`
  query {
    links {
      url
      pageTitle
      description
    }
  }
`

const ADD_LINK = gql`
  mutation addLink($url: String!) {
    addLink(url: $url) {
      url
    }
  }
`

const IndexPage = () => {
  const [url, setUrl] = React.useState("")
  const { loading, error, data } = useQuery(GET_LINKS)
  const [addLink] = useMutation(ADD_LINK)

  const handleAddLink = () => {
    addLink({
      variables: {
        url,
      },
      refetchQueries: [{ query: GET_LINKS }],
    })
  }

  if (loading) {
    return <div>Loading</div>
  }

  if (error) {
    console.log(error)
    return <div>Error</div>
  }

  console.log(data)
  return (
    <Layout>
      <div className="input-container" >
        <input type="text" value={url} onChange={e => setUrl(e.target.value)} />
        <button onClick={handleAddLink}>Add Link</button>
      </div>

      <div className="container">
        {data.links.map((d, i) => (
          <ItemContainer
            key={i}
            url={d.url}
            pageTitle={d.pageTitle}
            description={d.description}
          />
        ))}
      </div>
    </Layout>
  )
}

export default IndexPage
