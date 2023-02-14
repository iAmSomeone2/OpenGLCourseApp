export const GL_FLOAT_SIZE = 4;

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

export async function downloadBinaryFile(fileUrl: URL | string): Promise<ArrayBuffer> {
    const fileRequest = fetch(fileUrl);

    let fileBuffer: ArrayBuffer;

    try {
        fileBuffer = await (await fileRequest).arrayBuffer();
    } catch (err) {
        return Promise.reject(err);
    }

    return fileBuffer;
}
