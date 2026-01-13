const tshirt = {
    name : '',
    variations: [],
    options: [],
    images: [],
    setVariations(data) {
        this.variations = data;
    },
    getVariations() {
        return this.variations;
    },
    setOptions(data) {
        this.options = data;
    },
    getOptions() {
        return this.options;
    },
    setImages(data) {
        this.images = data;
    },
    getImages() {
        return this.images;
    },
    setName(str) {
        this.name = str;
    },
    getName() {
        return this.name;
    }
};
// Save value of option when user selected.
var globalSelected = [];


// Do not set to const because the value will update when loading product by ajax.
var inputName = jQuery('input[name="name"]');
var inputPrice = jQuery('input[name="price"]');
var inputSku = jQuery('input[name="sku"]');
var inputImage = jQuery('input[name="image"]');
var productPrice = jQuery('.product-page-price');
var productImage = jQuery('.img-custom-zoom');


jQuery(document).ready(function () {

    showDefaultVariation();

    jQuery(document).on('click', '.variable-item', function (e) {
        const option = jQuery(this).attr('data-option');
        const options = JSON.parse(tshirt.getOptions());
        const value = jQuery(this).attr('data-value');
        // Update position of class selected.
        const lowCaseOption = option.replaceAll(' ', '__').toLowerCase();

        jQuery(`.option-${lowCaseOption} li`).removeClass('selected');
        jQuery(this).addClass('selected');
        jQuery(`.label-${lowCaseOption}`).html(`<b>${option}:</b> ${value}`);

        if(options.hasOwnProperty(option)) {
            
            const indexOption = Object.keys(options).indexOf(option);

            globalSelected[indexOption] = value;
            globalSelected.length = indexOption + 1;

            const childOptions = getChildOption(globalSelected);
            const childKeys = Object.keys(childOptions);
            if(childKeys.length > 0) {
                const selected = renderSubOptions(childOptions);
                getSelectedProduct(selected);
            }else {
                getSelectedProduct(globalSelected);
            }

        }else {
            return 0;
        }
    });

    if (jQuery("#custom_file").length > 0) {
      jQuery("#custom_file").on("input", function (e) {
        e.preventDefault();

        const file = jQuery("#custom_file")[0].files[0];
        const formData = new FormData();
        formData.append("custom_file", file);
        formData.append("custom_file_ajax", true);
        jQuery.ajax({
          type: "POST",
          url: `https://img.bizticket.net/upload.php`,
          success: function (data) {
            data = JSON.parse(data);
            const fileName = data.file_name;
            const fileUrl = data.file_url;
            jQuery("input[name=custom_file_name]").val(fileName);
            jQuery("input[name=custom_file_url]").val(fileUrl);
          },
          error: function (error) {
            console.log(error);
          },
          data: formData,
          contentType: false,
          processData: false,
          timeout: 60000,
        });
      });
    }

    jQuery('.col').click(function () {
        const src = jQuery(this).children('a').children('img').prop('src');
        if(src !== undefined) {
            jQuery('.img-custom-zoom').prop('src', src);
            jQuery('.col').removeClass('is-nav-selected');
            jQuery(this).addClass('is-nav-selected');
        }
    });
});


function getSelectedProduct(selected) {
    selected.forEach(select => {
        if(globalSelected.indexOf(select) === -1) {
            globalSelected.push(select);
        }
    });

    const variations = JSON.parse(tshirt.getVariations());
    let product = null;
    variations.forEach(variation => {
        const options = variation.option;
        if(JSON.stringify(globalSelected) === JSON.stringify(options)) {
            product = variation;
            return 0;
        }
    });
    if(product !== null) {
        applyProductValue(product);
    }
}

function renderSubOptions(values) {
    const keys = Object.keys(values);
    let defaultValue = [];
    for (let i = 0; i < keys.length; i++) {
        const keyName = keys[i];
        const options = values[keyName];
        const lowCaseOption = keyName.replaceAll(' ', '__').toLowerCase();
        let label = "";
        jQuery(`.option-${lowCaseOption} li`).remove();
        if(options.length > 0) {

            for (let j = 0; j < options.length; j++) {
                let selected = '';
                if(j === 0) {
                    selected = 'selected';
                    label = options[j];
                    defaultValue.push(label);
                }
                const option = options[j];
                let html = `<li class="variable-item ${selected}" data-value="${option}" data-option="${keyName}">
                    <span class="variable-item-span variable-item-span-button">${option}</span>
                    </li>    
                `;
                jQuery(`.option-${lowCaseOption}`).append(html);
                jQuery(`.label-${lowCaseOption}`).html(`<b>${keyName}:</b> ${label}`);
                jQuery(`.label-${lowCaseOption}`).show();
            }
        }else {
            jQuery(`.label-${lowCaseOption}`).hide();
        }

    }

    return defaultValue;
}


function getChildOption(selected) {

    const variations = JSON.parse(tshirt.getVariations());
    const options = JSON.parse(tshirt.getOptions());
    var mMap = {};
    var countKey = Object.keys(options).length;

    for (let i = selected.length; i < countKey; i++) {
        const keys = Object.keys(options);
        const optionName = keys[i];
        let values = [];
        variations.forEach(variation => {
            const proOptions = variation.option;
            
            if(selected.every(v => proOptions.includes(v))) {
                const value = proOptions[i];
                if(values.indexOf(value) === -1) {
                    values.push(value);
                }
            }
        });
        mMap[optionName] = values;
    }
    return mMap;
}

function showDefaultVariation() {
    let values = jQuery('input[name="select_value[]"]').map(function () {
        return jQuery(this).val();
    }).get();

    let prName = values[0];
    if (prName === undefined) return;
    prName = prName.replaceAll("__", " ");
    values[0] = prName;

    const variations = JSON.parse(tshirt.getVariations());
    var product = null;
    variations.forEach(function (variation) {
        const option = variation['option'];
        if(JSON.stringify(values) == JSON.stringify(option)) {
            product = variation;
            return;
        }
    });

    if(product != null) {
        globalSelected = product.option;
        applyProductValue(product);
    }
}

function applyProductValue(product) {
    inputPrice.val(product.price);
    restProductPrice(product.price);
    inputSku.val(product.sku);
    const src = getImageSrc(product.image_id);
    resetProductImage(src);
    inputImage.val(src);
    productImage.val(src);
    inputName.val(tshirt.getName());
    jQuery('input[name="select_value[]"]').val(globalSelected);
}

function getImageSrc(imageId) {
    let images = tshirt.getImages();

    let src = ""; // Change to default image.
    if (images === null || images === "") {
        return src;
    }

    images = JSON.parse(images);

    images.forEach(function (image) {
        if (image.id === imageId) {
            src = image.src;
        }
    });

    if(src === "") {
        src = images[0].src;
    }

    return src;
}

function restProductPrice(price) {
    let html = `<span class="woocommerce-Price-amount amount">
        <span class="woocommerce-Price-currencySymbol">€</span>${price}</span>`;
    productPrice.html(html);
}

function resetProductImage(imgSrc) {
    productImage.attr('src', imgSrc);
}