import TopOffersWidget from './TopOffersWidget'
import QuickLinksWidget from './QuickLinksWidget'
import CitySelectorWidget from './CitySelectorWidget'
import PollWidget from './PollWidget'

export default function Sidebar() {
  return (
    <div className="grid gap-4">
      <TopOffersWidget />
      <QuickLinksWidget />
      <CitySelectorWidget />
      <PollWidget />
    </div>
  )
}
