import Layout from '@/components/layout/Layout';
import Seo from '@/components/Seo';

export default function PostsPage() {
  return (
    <Layout>
      <Seo templateTitle='posts' />
      <main>
        <section className='bg-white'>
          <div className='layout flex flex-col justify-center'>
            <div className='text-sm text-gray-800'>coming soon :)</div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
