import { Helmet } from 'react-helmet-async';
import { AppLayout } from '@/components/layouts/AppLayout';
import { MixxEconomy } from '@/components/economy';

export default function Economy() {
  return (
    <AppLayout>
      <Helmet>
        <title>MixxCoinz Economy | MixClub</title>
        <meta name="description" content="Earn, spend, and unlock with MixxCoinz - the ownership economy of MixClub." />
      </Helmet>
      <div className="container max-w-4xl py-6 px-4">
        <MixxEconomy />
      </div>
    </AppLayout>
  );
}
