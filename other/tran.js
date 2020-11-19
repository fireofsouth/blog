function format(number) {
    return number && number.replace(/(?!^)(?=(\d{3})+\.)/g, ',');
}
