import { auth } from '@clerk/nextjs/server'
import { PlanningWizard } from '@/components/meals/planning-wizard'

export default async function PlanningPage() {
  await auth.protect()

  return (
    <div className="pb-16 lg:pb-0">
      <PlanningWizard />
    </div>
  )
}
