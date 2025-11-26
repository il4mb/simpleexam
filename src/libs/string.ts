export function formatReadable(key: string): string {
    return key
        // pisahkan sebelum huruf kapital
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        // ganti tanda "-" atau "_" dengan spasi
        .replace(/[-_]/g, " ")
        // kapitalisasi tiap kata
        .replace(/\b\w/g, (c) => c.toUpperCase());
}
