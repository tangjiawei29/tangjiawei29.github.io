document.addEventListener('DOMContentLoaded', function() {
    var categories = [
        {id: 1, name: 'CPU+主板', items: []},
        {id: 2, name: '显卡', items: []},
        {id: 3, name: '电源', items: []},
        {id: 4, name: '散热器', items: []},
        {id: 5, name: 'SSD', items: []},
        {id: 6, name: '机箱', items: []},
        {id: 7, name: '机箱风扇', items: []},
        {id: 8, name: '内存', items: []},
        {id: 9, name: '其他', items: []}
    ];
    function initPage() {
        const totalPrice = document.createElement('label');
        totalPrice.innerText='总价:';
        totalPrice.className='ttl';
        const ttl = document.createElement('div');
        ttl.appendChild(totalPrice);
        document.getElementById('totalprice').appendChild(totalPrice);

        categories.forEach(createCategorySection);
        document.getElementById('categoriesContainer').addEventListener('click', function(e) {
            if (e.target.matches('[onclick^="addItem"]')) {
                const categoryId = parseInt(e.target.getAttribute('data-category-id'));
                addItem(categoryId);
                e.preventDefault();
            }
        });

        const section = document.createElement('div');

        const clearButton = document.createElement('button');
        clearButton.innerText='清空';
        clearButton.className='clearall-button';
        clearButton.addEventListener('click',function(){
            clearLocalStorage();
        },false);

        const uploadButton = document.createElement('button');
        uploadButton.innerText='上传';
        uploadButton.className='upload-button';
        uploadButton.addEventListener('click',function(){
            uploadLocalStorage();
        },false);

        const downloadButton = document.createElement('button');
        downloadButton.innerText='下载';
        downloadButton.className='download-button';
        downloadButton.addEventListener('click',function(){
            downloadLocalStorage();
        },false);

        const printButton = document.createElement('button');
        printButton.innerText='打印';
        printButton.className='print-button';
        printButton.addEventListener('click',function(){
            print();
        },false);


        section.appendChild(clearButton);
        section.appendChild(downloadButton);
        section.appendChild(uploadButton);
        section.appendChild(printButton);

        document.getElementById('totalprice').appendChild(section);

        document.getElementById('fileInput').addEventListener('change', function(e) {
           readFileToLocalStorage(e);
        });
      
    }
    function addItem(categoryId) {

        const newItem = {
            id: categoryId, // 简单使用时间戳作为ID
            name: prompt('请输入商品名称:'),
            note: prompt('请输入商品渠道:'),
            price: parseFloat(prompt('请输入商品价格:')),
        };
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (newItem.name && newItem.price) {
            category.items.push(newItem);
            const table = document.querySelectorAll('.category')[categoryId - 1].querySelector('table');
            addItemToTable(table, newItem, categoryId);
            updateTotal(categoryId);
        }
        saveToLocalStorage();

    }

    function delItem(categoryId) {
        const table = document.querySelectorAll('.category')[categoryId - 1].querySelector('table');
        const checkboxes = table.querySelectorAll('input[type="checkbox"]:checked');
    
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            const itemName = row.cells[1].textContent;
            const note = row.cells[2].textContent;
            // const itemPrice = parseFloat(row.cells[2].textContent);
    
            // 从categories数组中移除对应的item
            const category = categories.find(c => c.id === parseInt(categoryId));
            const itemToRemove = category.items.find(item => item.name === itemName && item.note === note);
            if (itemToRemove) {
                const index = category.items.indexOf(itemToRemove);
                if (index > -1) {
                    category.items.splice(index, 1);
                }
            }
    
            // 从DOM中移除对应的行
            row.remove();
    
           
            
        });
         // 更新总价
        updateTotal();
        saveToLocalStorage();
    }

    function loadItem(categoryId, newItem) {
        const category = categories.find(c => c.id === parseInt(categoryId));
        if (newItem.name && newItem.price) {
            // category.items.push(newItem);
            const table = document.querySelectorAll('.category')[categoryId - 1].querySelector('table');
            addItemToTable(table, newItem, categoryId);
            updateTotal(categoryId);
        }
    }
    function createCategorySection(category) {
        
        const section = document.createElement('div');
        section.className='category';
        section.innerHTML = `
            <h3>${category.name}</h3>
            <table>
                <tr>
                    <th>选择</th>
                    <th>名称</th>
                    <th>渠道</th>
                    <th>价格</th>
                </tr>
            </table>
        `;
        const addButton = document.createElement('button');
        addButton.textContent = '添加';
        addButton.classList.add('add-item-button');
        addButton.dataset.categoryId = category.id; // 使用data属性传递categoryId
        addButton.addEventListener('click',function(){
            addItem(this.dataset.categoryId);
        },false);
        const delButton = document.createElement('button');
        delButton.textContent = '删除';
        delButton.classList.add('delete-item-button');
        delButton.dataset.categoryId = category.id; // 使用data属性传递categoryId
        delButton.addEventListener('click',function(){
            delItem(this.dataset.categoryId);
        },false);

        section.appendChild(addButton);

        section.appendChild(delButton);
        document.getElementById('categoriesContainer').appendChild(section);
    }

    function updateTotal() {
        
        const selectedItems = Array.from(document.querySelectorAll('input[type="checkbox"]'))
                                .filter(checkbox => checkbox.checked)
                                .map(checkbox => {
                                    const row = checkbox.closest('tr');
                                    return parseFloat(row.cells[3].textContent);
                                });
        const total = selectedItems.reduce((acc, price) => acc + price, 0);
        
        document.getElementsByClassName('ttl')[0].innerHTML='总价: '+total.toFixed(2)+'元';    
        // document.getElementsByClassName('ttl').value='1123';    

        // document.getElementsByClassName('ttl').innerText='1123';    

    }

    function addItemToTable(table, item) {
        const row = table.insertRow(-1);
        row.innerHTML = `
            <td class="column1"><input type="checkbox"  data-item-id="${item.id}"></td>
            <td class="column2">${item.name}</td>
            <td class="column3">${item.note || '-'}</td>
            <td class="column4">${item.price}</td>
        `;
        const checkbox = row.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            updateTotal();
        });
        row.addEventListener('click', function() {
            checkbox.click(); // 触发checkbox的点击事件
        });
    }

    function clearLocalStorage() {
        localStorage.clear();
        location.reload();
    }
    function downloadLocalStorage() {
        const ls = localStorage.getItem('categories');
        if (ls) {
            var blob = new Blob([ls], {type: "text/plain;charset=utf-8"});
          
            var link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = 'mybuild';
            link.style.display = "none";
            
            document.body.appendChild(link);
            
            link.click();
            
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } else {
            console.error("No localStorage");
        }
    }
    function uploadLocalStorage() {
        document.getElementById('fileInput').click();

    }
    function saveToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
        // const ls = localStorage.getItem('categories');
        // if (ls != null) {
        //     categories.length=0;
        //     categories = JSON.parse(ls);
        // }
    }
    function readFileToLocalStorage(e) {
        var file = e.target.files[0];
        if (!file) {
            return; // 没有选择文件
        }
        if (file.type !== 'text/plain') {
            alert('请选择一个txt文件！');
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            console.log(contents); // 文件内容现在存储在contents变量中
            localStorage.setItem('categories', contents);
            location.reload();
        };
        reader.readAsText(file); // 读取文件内容为文本
      
    }

    function print() {
        // 创建隐藏的canvas用于绘制
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        // 计算表格样式，以适应canvas绘制
        const tableWidth = 800; // 示例宽度，可根据实际调整
        const tableHeight = 1000; // 示例高度，根据内容动态调整
        const cellPadding = 5;
        const titleFontSize = 30;
        const fontSize = 20;
        const headerFontSize = 25;
        let currentY = 50; // 起始绘制位置
    
        canvas.width = tableWidth;
        canvas.height = tableHeight;
    
        // 遍历所有表格，找到选中的item
        const selectedItems = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
                                .map(checkbox => {
                                    const row = checkbox.closest('tr');
                                    return {
                                        categoryName: row.parentNode.parentNode.previousElementSibling.textContent,
                                        itemName: row.cells[1].textContent,
                                        note: row.cells[2].textContent,
                                        price: row.cells[3].textContent
                                    };
                                });
    
        // 分类并绘制到canvas
        const categoriesMap = new Map();
        selectedItems.forEach(item => {
            if (!categoriesMap.has(item.categoryName)) {
                categoriesMap.set(item.categoryName, []);
            }
            categoriesMap.get(item.categoryName).push(item);
        });
        drawTitle(ctx, '配置单', titleFontSize, tableWidth, cellPadding);
        currentY += titleFontSize + cellPadding;
        categoriesMap.forEach((items, categoryName) => {
            drawCategoryHeader(ctx, categoryName, headerFontSize, currentY);
            currentY += headerFontSize + cellPadding; // 增加一些间距
    
            items.forEach((item, index) => {
                drawItemRow(ctx, item.itemName, item.note, item.price, fontSize, currentY, index === 0);
                currentY += fontSize + cellPadding; // 每行间距
            });
    
            currentY += fontSize; // 类别间间距
        });
        drawTotal(ctx, document.getElementsByClassName('ttl')[0].innerHTML, headerFontSize, currentY);
    
        // 将canvas转换为图片URL
        const imgDataUrl = canvas.toDataURL('image/png');
            // 在新窗口中展示图片
        const newWindow = window.open('', '_blank'); // 打开一个新窗口
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Selected Items</title>
                <style>
                    body, html {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    img {
                        max-width: 100%;
                        max-height: 100vh;
                        background-color: #f0f0f0;
                    }
                </style>
            </head>
            <body>
                <img src="${imgDataUrl}" alt="Selected Items">
            </body>
            </html>
        `);
        newWindow.document.close(); // 确保文档流关闭，以便图片能够正确加载
    }
    
    // 辅助函数：绘制类别标题
    function drawTitle(ctx, customTitle, fontSize, tableWidth, cellPadding){
        ctx.font = fontSize  + 'px Arial';
        // ctx.textAlign = "center"; // 居中对齐标题
        ctx.fillText(customTitle, tableWidth / 2- ctx.measureText(customTitle).width/2, fontSize + cellPadding * 2); // 调整y坐标以确保标题位于顶部并考虑一些间距
    }
    function drawTotal(ctx, customTitle, fontSize, y){
        ctx.font = fontSize  + 'px Arial';
        ctx.fillText(customTitle, 500, y); // 调整y坐标以确保标题位于顶部并考虑一些间距
    }
    function drawCategoryHeader(ctx, text, fontSize, y) {
        ctx.font = fontSize + 'px Arial';
        ctx.fillText(text, 50, y);
    }
    
    // 辅助函数：绘制商品行
    function drawItemRow(ctx, itemName, note, price, fontSize, y, isFirst) {
        ctx.font = fontSize + 'px Arial';
        ctx.fillText(itemName, 70, y);
        ctx.fillText(note, 500, y); // 假设列宽
        ctx.fillText(parseFloat(price).toFixed(2)+'元', 600, y); // 假设列宽
    }

    
    function loadTable(){
        const ls = localStorage.getItem('categories');
        if (ls != null) {
            categories.length=0;
            categories = JSON.parse(ls);
            for ( var c in categories){
                for( var i in categories[c].items) {
                    loadItem(categories[c].id, categories[c].items[i]);
                }
            }
        }
    }
    // 初始化页面
    // localStorage.clear();

    initPage();
    loadTable();
    
});
