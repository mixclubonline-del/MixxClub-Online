import { Helmet } from 'react-helmet-async';
import { MixxEconomy } from '@/components/economy';

export default function Economy() {
  return (
    <>
      <Helmet>
        <title>MixxCoinz Economy | Mixxclub</title>
        <meta name="description" content="Earn, spend, and unlock with MixxCoinz - the ownership economy of Mixxclub." />
      </Helmet>
      <div className="container max-w-4xl py-6 px-4">
        <MixxEconomy />
      </div>
    </>
  );
}
