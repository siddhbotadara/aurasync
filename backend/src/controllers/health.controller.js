export default async function checkHealth() {

    return {
        status: "ok",
        service: "aurasync-backend",
        uptime: process.uptime()
    };
}