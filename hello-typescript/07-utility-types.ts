// Utility Types — building new types out of existing ones.
// Goal: learn the built-in type transformations that ship with TypeScript.
//
// Run:  cd hello-typescript && npm install
//       npm run lesson -- 07

interface Article {
  id: number
  title: string
  body: string
  published: boolean
}

// Partial<T>: every field becomes optional — handy for a "patch" update.
function updateArticle(article: Article, patch: Partial<Article>): Article {
  return { ...article, ...patch }
}

// Pick<T, K>: keep only the listed fields.
type ArticleSummary = Pick<Article, 'id' | 'title'>

// Omit<T, K>: keep every field except the listed ones.
type NewArticle = Omit<Article, 'id'>

// Record<K, V>: an object type with keys K all mapping to value type V.
type ArticlesById = Record<number, Article>

// Readonly<T>: every field becomes readonly.
type FrozenArticle = Readonly<Article>

const article: Article = { id: 1, title: 'Draft', body: '...', published: false }
const published = updateArticle(article, { published: true })
const summary: ArticleSummary = { id: article.id, title: article.title }
const draft: NewArticle = { title: 'Untitled', body: '', published: false }
const byId: ArticlesById = { [article.id]: article }
const frozen: FrozenArticle = published

// frozen.title = 'New title' // Error: Cannot assign to 'title' because it is a read-only property.

console.log(published, summary, draft, byId, frozen)
