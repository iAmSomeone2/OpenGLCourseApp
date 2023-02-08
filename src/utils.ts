export async function downloadTextFile(fileUrl: URL | string): Promise<string> {
    const fileRequest = fetch(fileUrl);

    let fileText = "";

    try {
        fileText = await (await fileRequest).text();
    } catch (err) {
        return Promise.reject(err);
    }

    return Promise.resolve(fileText);
}