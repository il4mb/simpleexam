export function formatReadable(key: string): string {
    return key
        // pisahkan sebelum huruf kapital
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        // ganti tanda "-" atau "_" dengan spasi
        .replace(/[-_]/g, " ")
        // kapitalisasi tiap kata
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatNumber(num: number): string {
    if (num < 1000) return num.toString();
    if (num < 1_000_000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    if (num < 1_000_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
}
