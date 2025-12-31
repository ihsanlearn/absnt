import { getStoreStatus } from "../settings-actions"
import CheckoutForm from "./checkout-form"

// Force dynamic behavior since we check DB status
export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
    const isStoreOpen = await getStoreStatus()

    return <CheckoutForm initialStoreStatus={isStoreOpen} />
}
