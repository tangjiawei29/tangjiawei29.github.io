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


        section.appendChild(clearButton);
        section.appendChild(downloadButton);
        section.appendChild(uploadButton);
        
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
        //console.log(document.getElementsByClassName('ttl'));
        console.log(total);
        document.getElementsByClassName('ttl')[0].innerHTML='总价: '+total.toFixed(2)+'元';    
      
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
