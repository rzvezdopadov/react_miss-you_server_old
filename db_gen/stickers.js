const stickers = [
    {
        idstickerpack: "1",
        name: "Собачка",
	    discription: "Это стикерпак с собачкой =)",
        price: 0,
        author: "https://vk.com",
        stickers: [
            {position: 1, associate: "", link: "1_1.png"},
            {position: 2, associate: "", link: "1_2.png"},
            {position: 3, associate: "", link: "1_3.png"},
            {position: 4, associate: "", link: "1_4.png"},
            {position: 5, associate: "", link: "1_5.png"},
            {position: 6, associate: "", link: "1_6.png"},
            {position: 7, associate: "", link: "1_7.png"},
            {position: 8, associate: "", link: "1_8.png"},
            {position: 9, associate: "", link: "1_9.png"},
            {position: 10, associate: "", link: "1_10.png"},
            {position: 11, associate: "", link: "1_11.png"},
            {position: 12, associate: "", link: "1_12.png"},
            {position: 13, associate: "", link: "1_13.png"},
            {position: 14, associate: "", link: "1_14.png"},
            {position: 15, associate: "", link: "1_15.png"},
            {position: 16, associate: "", link: "1_16.png"},
            {position: 17, associate: "", link: "1_17.png"},
            {position: 18, associate: "", link: "1_18.png"},
            {position: 19, associate: "", link: "1_19.png"},
            {position: 20, associate: "", link: "1_20.png"},
            {position: 21, associate: "", link: "1_21.png"},
            {position: 22, associate: "", link: "1_22.png"},
            {position: 23, associate: "", link: "1_23.png"},
            {position: 24, associate: "", link: "1_24.png"},
            {position: 25, associate: "", link: "1_25.png"},
            {position: 26, associate: "", link: "1_26.png"},
            {position: 27, associate: "", link: "1_27.png"},
            {position: 28, associate: "", link: "1_28.png"},
            {position: 29, associate: "", link: "1_29.png"},
            {position: 30, associate: "", link: "1_30.png"},
            {position: 31, associate: "", link: "1_31.png"},
            {position: 32, associate: "", link: "1_32.png"},
            {position: 33, associate: "", link: "1_33.png"},
            {position: 34, associate: "", link: "1_34.png"},
            {position: 35, associate: "", link: "1_35.png"},
            {position: 36, associate: "", link: "1_36.png"},
            {position: 37, associate: "", link: "1_37.png"},
            {position: 38, associate: "", link: "1_38.png"},
            {position: 39, associate: "", link: "1_39.png"},
            {position: 40, associate: "", link: "1_40.png"},
            {position: 41, associate: "", link: "1_41.png"},
            {position: 42, associate: "", link: "1_42.png"},
            {position: 43, associate: "", link: "1_43.png"},
            {position: 44, associate: "", link: "1_44.png"},
            {position: 45, associate: "", link: "1_45.png"},
            {position: 46, associate: "", link: "1_46.png"},
            {position: 47, associate: "", link: "1_47.png"},
            {position: 48, associate: "", link: "1_48.png"},
            {position: 49, associate: "", link: "1_49.png"},
        ]
    },
    {
        idstickerpack: "2",
        name: "Динозаврик Дино",
	    discription: "Это стикерпак с динозавриком =)",
        price: 100,
        author: "https://t.me",
        stickers: [
            {position: 1, associate: "", link: "2_1.webp"},
            {position: 2, associate: "", link: "2_2.webp"},
            {position: 3, associate: "", link: "2_3.webp"},
            {position: 4, associate: "", link: "2_4.webp"},
            {position: 5, associate: "", link: "2_5.webp"},
            {position: 6, associate: "", link: "2_6.webp"},
            {position: 7, associate: "", link: "2_7.webp"},
            {position: 8, associate: "", link: "2_8.webp"},
            {position: 9, associate: "", link: "2_9.webp"},
            {position: 10, associate: "", link: "2_10.webp"},
            {position: 11, associate: "", link: "2_11.webp"},
            {position: 12, associate: "", link: "2_12.webp"},
            {position: 13, associate: "", link: "2_13.webp"},
            {position: 14, associate: "", link: "2_14.webp"},
            {position: 15, associate: "", link: "2_15.webp"},
            {position: 16, associate: "", link: "2_16.webp"},
            {position: 17, associate: "", link: "2_17.webp"},
            {position: 18, associate: "", link: "2_18.webp"},
            {position: 19, associate: "", link: "2_19.webp"},
            {position: 20, associate: "", link: "2_20.webp"},
        ]
    },
]

const arrStickersQuery = stickers.map((item)=>{
    strStickers = '';
    item.stickers.forEach((value)=>{
        strStickers += `'${JSON.stringify(value)}' :: JSON, `
    });
    strStickers = strStickers.slice(0, -2);
    
    let str = `INSERT INTO public.stickerpacks(idstickerpack, name, discription, price, author, stickers) VALUES (
        '${item.idstickerpack}', '${item.name}', '${item.discription}', ${item.price}, '${item.author}', 
        (ARRAY [${strStickers}]));`
    return str;
});


const app = document.getElementById('app');

arrStickersQuery.forEach((value) => {
    app.innerHTML += '<div><span>' + value + '</span></div>'
})


