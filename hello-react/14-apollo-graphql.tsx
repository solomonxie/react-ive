// Apollo Client: GraphQL queries with a mocked link (no server).
// Common in larger apps: a wrapper around Apollo's useQuery (from "@apollo/client/react" in v4),
// and typed query documents written with gql.
// Many apps send their main data through Apollo; TanStack Query (lesson 13) is
// often used for REST-style features.
//
// Ideas:
// - gql`...` parses a query string into a document. Variables are passed beside it.
// - useQuery returns { data, loading, error, ... } and caches by query + variables.
// - In Apollo Client 4, React hooks come from "@apollo/client/react".
// - A custom wrapper hook (like useAppQuery) adds app-wide behaviour around useQuery.
// - Here an ApolloLink answers queries from memory, standing in for the network.
//
// Run:  npm run lesson -- 14
// Open: http://localhost:5173/

import { ApolloClient, ApolloLink, gql, InMemoryCache, type TypedDocumentNode } from '@apollo/client'
import { ApolloProvider, useQuery } from '@apollo/client/react'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Observable } from 'rxjs'

interface Brand {
  id: string
  name: string
}
interface BrandsData {
  brands: Brand[]
}
interface BrandsVars {
  search: string
}

// TypedDocumentNode ties data and variables types to the document, so useQuery infers them.
const BRANDS: TypedDocumentNode<BrandsData, BrandsVars> = gql`
  query Brands($search: String!) {
    brands(search: $search) {
      id
      name
    }
  }
`

// Mock "network": returns data after a delay, or an error for search "boom".
const ALL = ['Acme', 'Aurora', 'Bolt', 'Cascade', 'Delta'].map((name) => ({ id: name.toLowerCase(), name, __typename: 'Brand' }))
const mockLink = new ApolloLink((operation) => {
  return new Observable((subscriber) => {
    const timer = setTimeout(() => {
      const search = String(operation.variables.search ?? '')
      if (search === 'boom') {
        subscriber.error(new Error('Mock server exploded'))
        return
      }
      const brands = ALL.filter((brand) => brand.name.toLowerCase().includes(search.toLowerCase()))
      subscriber.next({ data: { brands } })
      subscriber.complete()
    }, 500)
    return () => clearTimeout(timer)
  })
})

const client = new ApolloClient({ cache: new InMemoryCache(), link: mockLink })

// Small wrapper in the spirit of useAppQuery: one place for shared options.
function useBrands(search: string) {
  return useQuery(BRANDS, { variables: { search } })
}

function BrandList() {
  const [search, setSearch] = useState('')
  const { data, loading, error } = useBrands(search)

  return (
    <div>
      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder='try "a" or "boom"' />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'crimson' }}>Error: {error.message}</p>}
      {data && (
        <ul>
          {data.brands.map((brand) => <li key={brand.id}>{brand.name}</li>)}
        </ul>
      )}
      <p><small>Type, delete, retype: repeated searches come from Apollo's cache.</small></p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <h1>Apollo Client (mocked link)</h1>
    <BrandList />
  </ApolloProvider>,
)
