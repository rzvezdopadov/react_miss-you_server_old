import { IStickerpack } from "../interfaces/istickers";
import { poolDB } from "../db/config";

export async function getAllStickerpacks(): Promise<IStickerpack[]> {
	try {
		let queryStr =
			`SELECT idstickerpack, name, discription, price, author, stickers ` +
			`FROM stickerpacks`;

		const answerDB = await poolDB.query(queryStr);

		return answerDB.rows;
	} catch (error) {
		console.log("getAllStickerpacks", error);
		return undefined;
	}
}

export async function getStickerpackById(
	idStickerpack: string
): Promise<IStickerpack> {
	const stickerpack: IStickerpack = {
		idstickerpack: "",
		name: "",
		discription: "",
		price: 0,
		author: "",
		stickers: [],
	};

	try {
		let queryStr =
			`SELECT idstickerpack, name, discription, price, author, stickers ` +
			`FROM stickerpacks ` +
			`WHERE idstickerpack = '${idStickerpack}'`;

		const answerDB = await poolDB.query(queryStr);

		return answerDB.rows[0];
	} catch (error) {
		console.log("getAllStickerpacks", error);
		return undefined;
	}
}
