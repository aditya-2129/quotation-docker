import { QuotationDashboard } from "@/components/features/QuotationDashboard";

/**
 * Quotation Dashboard Page
 * Route: /quotations
 */
export default function QuotationsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <QuotationDashboard />
      </div>
    </main>
  );
}
