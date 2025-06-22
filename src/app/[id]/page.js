import ArticleDetail from '../../components/ArticleDetail';

export default async function ArticlePage({ params }) {
  const { id } = await params;
  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-indigo-100 via-white to-blue-50 flex flex-col" style={{paddingTop: '80px'}}>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl">
          <ArticleDetail articleId={id} />
        </div>
      </div>
    </div>
  );
}
