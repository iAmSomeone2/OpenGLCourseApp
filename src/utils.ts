import { vec3 } from "gl-matrix";

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

export function clamp(value: number, min: number, max: number): number {
    if (value > max) {
        return max;
    } else if (value < min) {
        return min
    } else {
        return value;
    }
}

export function calculateAverageNormals(indices: number[], vertices: number[], vertexLength: number, normalOffset: number): void {
    for (let i = 0; i < indices.length; i += 3) {
        let in0 = indices[i] * vertexLength;
        let in1 = indices[i + 1] * vertexLength;
        let in2 = indices[i + 2] * vertexLength;

        const v1 = vec3.fromValues(
            vertices[in1] - vertices[in0],
            vertices[in1 + 1] - vertices[in0 + 1],
            vertices[in1 + 2] - vertices[in0 + 2]
        );

        const v2 = vec3.fromValues(
            vertices[in2] - vertices[in0],
            vertices[in2 + 1] - vertices[in0 + 1],
            vertices[in2 + 2] - vertices[in0 + 2]
        );

        const normal = vec3.create();
        vec3.cross(normal, v1, v2);
        vec3.normalize(normal, normal);

        in0 += normalOffset;
        in1 += normalOffset;
        in2 += normalOffset;

        vertices[in0] += normal[0];
        vertices[in0 + 1] += normal[1];
        vertices[in0 + 2] += normal[2];

        vertices[in1] += normal[0];
        vertices[in1 + 1] += normal[1];
        vertices[in1 + 2] += normal[2];

        vertices[in2] += normal[0];
        vertices[in2 + 1] += normal[1];
        vertices[in2 + 2] += normal[2];
    }

    for (let i = 0; i < vertices.length / vertexLength; i++) {
        const nOffset = i * vertexLength + normalOffset;

        const vec = vec3.fromValues(vertices[nOffset], vertices[nOffset + 1], vertices[nOffset + 2]);
        vec3.normalize(vec, vec);

        vertices[nOffset] = vec[0];
        vertices[nOffset + 1] = vec[1];
        vertices[nOffset + 2] = vec[2];
    }
}
