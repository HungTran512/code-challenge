import React, { useMemo } from 'react'

interface WalletBalance {
    currency: string;
    amount: number;
    blockchain: string; // Fix: Added missing property
}

interface FormattedWalletBalance {
    currency: string;
    amount: number;
    formatted: string;
    blockchain: string;
}

interface Props extends BoxProps {

}

const PRIORITY: Record<string, number> = {
    Osmosis: 100,
    Ethereum: 50,
    Arbitrum: 30,
    Zilliqa: 20,
    Neo: 20,
}

const getPriority = (blockchain: string): number => { // Fix: Moved out of component; changed 'any' to 'string'
    return PRIORITY[blockchain] ?? -99
}

const WalletPage: React.FC<Props> = (props: Props) => {
    const { children, ...rest } = props;
    const balances = useWalletBalances()
    const prices = usePrices()

    const sortedBalances = useMemo(() => {
        return balances
            .filter((balance: WalletBalance) => {
                const balancePriority = getPriority(balance.blockchain)
                // Fix: Corrected filtering logic
                return balancePriority > -99 && balance.amount > 0
            })
            .map((balance: WalletBalance) => ({
                ...balance,
                priority: getPriority(balance.blockchain), // Fix: Cache priority once before sort
            }))
            .sort((lhs, rhs) => rhs.priority - lhs.priority) // Fix: Explicit numeric compare (includes equal case)
            .map(({ priority, ...balance }) => balance)
    }, [balances]) // Fix: Removed unnecessary 'prices' dependency

    const formattedBalances: FormattedWalletBalance[] = sortedBalances.map((balance: WalletBalance) => {
        return {
            ...balance,
            formatted: balance.amount.toFixed(),
        }
    })

    const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount // Fix: Guard missing price
        return (
            <WalletRow
                className={classes.row}
                key={`${balance.blockchain}-${balance.currency}`} // Fix: Stable key instead of index
                amount={balance.amount}
                usdValue={usdValue}
                formattedAmount={balance.formatted}
            />
        )
    })

    return (
        <div {...rest}>
            {rows}
        </div>
    )
}

export default WalletPage
