export const normalizeIP = (ip?: string): string => {
    if (!ip) return "0.0.0.0";

    // IPv6 localhost
    if (ip === "::1") {
        return "127.0.0.1";
    }

    // Remove IPv6 prefix
    if (ip.startsWith("::ffff:")) {
        return ip.replace("::ffff:", "");
    }

    return ip;
};