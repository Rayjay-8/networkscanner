function generateIpRange(baseIp, start, end) {
    const ipRange = [];
    const octets = baseIp.split('.');

    for (let i = start; i <= end; i++) {
        const ip = `${octets[0]}.${octets[1]}.${octets[2]}.${i}`;
        ipRange.push(ip);
    }

    return ipRange;
}

export default generateIpRange