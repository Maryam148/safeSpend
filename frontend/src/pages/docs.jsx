import { useState } from 'react';

const sections = {
  About: `
Welcome to the Islamic Finance Calculator Suite. This platform includes 9 distinct calculators covering key financial tools like Zakat, Leasing (Ijarah), Profit Sharing (Mudarabah), Murabaha, Istisna, Takaful, Qard Hasan, Business Partnership Split, and Islamic Pension Planner. Each calculator complies with Islamic finance principles and is designed to assist in your financial planning.

Use the side menu to navigate to any calculator’s documentation, which explains its required inputs and other important information.
  `,
  "Zakat Calculator": `

What is Zakat?
Zakat is a mandatory form of almsgiving in Islam, calculated at 2.5% of a Muslim’s eligible wealth above a minimum threshold (Nisab).

Inputs:
- Cash: Total liquid cash including wallet, bank accounts, etc.
- Gold/Silver: Enter total weight in grams or tolas. The system fetches current market rates automatically.
- Business Assets: Include stock-in-trade, goods for sale, and receivables.
- Liabilities: Debts that are currently due and deductible from zakatable assets.

Note: Zakat is due if the total assets exceed the Nisab threshold (value of 87.48g gold or 612.36g silver). It is calculated at 2.5%.
  `,
  "Leasing (Ijarah) Calculator": `

What is Ijarah?
Ijarah is an Islamic leasing agreement where the financier retains ownership and leases the asset to the client for an agreed rent.

Inputs:
- Asset Value: The total cost of the leased asset (e.g., car, property).
- Lease Term (Months): Number of months for the lease duration.
- Rent Rate (%): Monthly rental rate applied to the asset value.
- Maintenance & Insurance: Any additional monthly or one-time costs.
- Vehicle Price: The full purchase price of the vehicle being leased.
- Down Payment: An initial lump sum paid upfront by the lessee to reduce the lease amount.
- Trade-In Value: The value of any existing vehicle being traded in, which reduces the effective cost of the new lease.
- Annual Mileage: The estimated number of miles/kilometers the lessee expects to drive annually. This affects the residual value.
- Residual Value Percentage: The estimated value of the vehicle at the end of the lease term, expressed as a percentage of the original vehicle price. This is crucial for calculating monthly payments.
- Money Factor: This is equivalent to an interest rate in a conventional lease, converted to a different format. It reflects the cost of borrowing for the lease.
- Interest Rate: The annual interest rate associated with the lease, directly if not using a money factor.
- Sales Tax Rate: The applicable sales tax percentage on the lease payments or the vehicle price, depending on local regulations.
- Acquisition Fee: An administrative fee charged by the lessor for initiating the lease.
- Disposition Fee: A fee charged at the end of the lease for returning the vehicle.
- Security Deposit: A refundable deposit held by the lessor to cover potential damages or excess wear and tear.
- First Month Payment: The initial payment required at the lease signing, often including the first month's rent.
- GAP Insurance: Guaranteed Asset Protection insurance, which covers the difference between the actual cash value of the vehicle and the remaining lease balance if the vehicle is stolen or totaled.
- Extended Warranty: Additional warranty coverage beyond the manufacturer's standard warranty.
- Maintenance Package: A prepaid service plan covering routine maintenance for the leased vehicle.

Note: Ownership remains with the lessor; the lessee pays for usage over time. The terms must be Shariah-compliant, avoiding interest (riba) and ensuring clear ownership and risk transfer according to Islamic principles.
  `,
  "Profit Sharing (Mudarabah) Calculator": `

What is Mudarabah?
Mudarabah is a partnership where one party provides capital (Rabb-ul-Mal) and the other provides expertise (Mudarib).

Inputs:
- Rabb-ul-Mal Investment: Capital provided by the investor.
- Mudarib Investment: Optional amount contributed by working partner.
- Total Revenue: Expected or realized revenue.
- Total Expenses: All expenses associated with the venture.
- Profit Sharing Ratios: Agreed percentage distribution for profits.

Note: Profits are shared as per agreement. Losses are borne by Rabb-ul-Mal unless due to Mudarib’s negligence.
  `,
  "Murabaha Calculator": `

What is Murabaha?
Murabaha is a cost-plus-profit sale contract where the seller discloses both the cost and profit margin to the buyer.

Inputs:
- Asset Cost: Original cost of the asset being sold.
- Profit Margin (%) or Amount: Specify either the profit percentage or a fixed profit amount.
- Down Payment: Initial payment made at the start.
- Processing Fee / Documentation Fee / Insurance Cost**: Additional fees involved in the transaction.
- Payment Frequency: Choose from Monthly, Quarterly, Semi-Annual, Annual.
- Payment Term (Months): Total duration for repayment.
- Grace Period: Optional delay before payments start.
- Early Settlement Discount: Discount percentage if full payment is made early.

Note: Sale is based on cost plus agreed profit disclosed upfront. Price and schedule are fixed.
  `,
  "Istisna Calculator": `

What is Istisna?
Istisna is a manufacturing contract where one party agrees to manufacture a specific item for another party with defined specifications and time.

Inputs:
- Manufacturing Cost: Estimated cost of producing/manufacturing the item.
- Profit Margin (%): Desired markup over the cost.
- Advance Payment: Amount paid upfront before production begins.
- Delivery Time (Months): Time required to manufacture and deliver.

Note: Istisna is used for made-to-order goods. Payment and delivery terms must be agreed before initiation.
  `,
  "Takaful Estimator": `

What is Takaful?**
Takaful is an Islamic cooperative insurance system where members contribute to a common pool used to support participants facing loss.

Inputs:
- Age: Age of the individual seeking coverage.
- Coverage Amount: Total amount to be covered by the Takaful plan.
- Duration (Years): Coverage period.
- Annual Contribution: Amount contributed yearly to the pool.
- Expected Return Rate (%): Optional rate assumed for fund growth.

**Note:** Takaful is a cooperative insurance concept where risks are shared. Contributions may be invested for halal returns.
  `,
  "Qard Hasan Planner": `

What is Qard Hasan?**
Qard Hasan is a benevolent interest-free loan given for welfare purposes or to help someone in need.

**Inputs:
- Loan Amount: Total interest-free loan granted.
- Repayment Period (Months)**: Timeframe for returning the loan.
- **Installment Frequency**: Monthly, Quarterly, etc.

Note: Qard Hasan is a benevolent loan with zero interest or hidden charges. Only principal is returned.
  `,
  "Business Partnership Split": `

What is a Business Partnership?
In Islamic finance, business partnerships must be based on clear contracts, risk sharing, and agreed-upon ratios.

Inputs:
- Partner Contributions: Amount invested by each partner.
- Profit Sharing Ratio (%): Agreed percentage for dividing profits.
- Expenses: Common costs to be deducted from revenue before splitting profits.

Note: Profit is divided based on agreed ratios. Loss is shared in proportion to capital invested unless otherwise agreed.
  `,
  "Islamic Pension Planner": `

What is an Islamic Pension Plan?
An Islamic pension plan helps Muslims prepare for retirement by investing savings in halal financial instruments.

Inputs:
- Current Age: Your current age.
- Retirement Age: Age at which you plan to retire.
- Monthly Contribution: Regular amount saved towards retirement.
- Expected Return (%): Estimated annual halal return on investments.
- Inflation Rate (%): Assumed annual inflation rate.

Note: This tool helps estimate halal retirement corpus, keeping Shariah principles in mind.
  `,
};

export default function Documentation() {
  const [activeSection, setActiveSection] = useState("About");

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-1/4 bg-white shadow-lg p-6 border-r">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Documentation</h2>
        <nav className="space-y-2">
          {Object.keys(sections).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-blue-100 transition ${
                activeSection === section ? 'bg-blue-200 font-semibold' : 'text-gray-700'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-3/4 p-10">
        <h1 className="text-3xl font-bold mb-6">{activeSection}</h1>
        <div className="prose max-w-none whitespace-pre-line">
          {sections[activeSection]}
        </div>
      </main>
    </div>
  );
}