import { Receipt } from "../types";

export function getTotalItemPrice(receipt: Receipt): number {
    return receipt.items.reduce((sum, item) => sum + item.price, 0);
}

export function getFinalPrice(receipt: Receipt): number {
    const totalItemPrice = getTotalItemPrice(receipt);
    const tax = receipt.tax ?? 0;
    const tips = receipt.tips ?? 0;
    return totalItemPrice + tax + tips;
}

export function getFormattedPrice(price: number | undefined): string | undefined {
    if (!price || price <= 0) return undefined
    return `$${(price).toFixed(2)}`;
}