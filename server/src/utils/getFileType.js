

export function getFileType(filePath) {

    const fileArr = filePath.split(".");

    const lastElement = fileArr.at(-1);

    if (lastElement == "png" || lastElement == "jpg" || lastElement == "jpeg") {
        return "image";
    }
    else if (lastElement == "mp4" || lastElement == "mpeg" || lastElement == "webp" ) {
        return "video";
    }

}