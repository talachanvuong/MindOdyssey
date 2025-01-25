import '../../../style.css'
document.addEventListener("DOMContentLoaded", function () {
    const docList = document.getElementById("document-list");
    const pagination = document.getElementById("pagination");
    const searchInput = document.getElementById("search");
    const filterButton = document.getElementById("filterButton");
    const timeFilterModal = document.getElementById("timeFilterModal");
    const applyFilter = document.getElementById("applyFilter");
    const closeModal = document.getElementById("closeModal");
    const startDateInput = document.getElementById("startDate");

    // Kiểm tra các phần tử DOM
    if (!docList || !pagination || !searchInput || !filterButton || !timeFilterModal || !applyFilter) {
        console.error("Không tìm thấy phần tử DOM cần thiết. Kiểm tra lại HTML của bạn.");
        return;
    }

    // Danh sách tài liệu giả lập
    const documents = Array.from({ length: 9 }, (_, i) => `Tài liệu ${i + 1}`);
    let curPage = 1;
    const itemsPerPage = 5;

    function renderList() {
        docList.innerHTML = "";
        const searchTerm = searchInput.value.toLowerCase();

        // Lọc theo tìm kiếm
        const filteredDocs = documents.filter(doc => doc.toLowerCase().includes(searchTerm));

        // Phân trang
        const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
        curPage = Math.min(curPage, totalPages) || 1; // Đảm bảo curPage hợp lệ

        const start = (curPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedDocs = filteredDocs.slice(start, end);

        if (paginatedDocs.length === 0) {
            const li = document.createElement("li");
            li.className = "py-4 text-center text-gray-500";
            li.textContent = "Không có kết quả phù hợp.";
            docList.appendChild(li);
            return;
        }

        paginatedDocs.forEach(doc => {
            const li = document.createElement("li");
            li.className = "flex items-center justify-between py-4 pr-5 pl-4 text-sm/6";
            li.innerHTML = `
                <div class="flex w-0 flex-1 items-center">
                    <svg class="size-5 shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path d="M64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16l160 0 0 80c0 17.7 14.3 32 32 32l80 0 0 288c0 8.8-7.2 16-16 16L64 464zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-293.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0L64 0zm56 256c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24l144 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-144 0z"/>
                    </svg>
                    <div class="ml-4 flex min-w-0 flex-1 gap-2">
                        <p class="truncate font-medium">${doc}</p>
                    </div>
                </div>
            `;
            docList.appendChild(li);
        });

        // Cập nhật phân trang
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        pagination.innerHTML = ""; 
        if (totalPages <= 1) return; 
    
        const nav = document.createElement("nav");
        nav.className = "isolate inline-flex -space-x-px rounded-md shadow-xs";
        nav.setAttribute("aria-label", "Pagination");
    
        const prevBtn = document.createElement("a");
        prevBtn.href = "#";
        prevBtn.className = `relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset ${
            curPage === 1 ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
        }`;
        prevBtn.innerHTML = `
            <span class="sr-only">Previous</span>
            <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
            </svg>
        `;
        prevBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (curPage > 1) {
                curPage--;
                renderList();
            }
        });
        nav.appendChild(prevBtn);
    
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement("a");
            pageBtn.href = "#";
            pageBtn.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                curPage === i ? "bg-indigo-600 text-white" : "text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50"
            }`;
            pageBtn.textContent = i;
            pageBtn.addEventListener("click", (e) => {
                e.preventDefault();
                curPage = i;
                renderList();
            });
            nav.appendChild(pageBtn);
        }
    
        const nextBtn = document.createElement("a");
        nextBtn.href = "#";
        nextBtn.className = `relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-gray-300 ring-inset ${
            curPage === totalPages ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
        }`;
        nextBtn.innerHTML = `
            <span class="sr-only">Next</span>
            <svg class="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
            </svg>
        `;
        nextBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (curPage < totalPages) {
                curPage++;
                renderList();
            }
        });
        nav.appendChild(nextBtn);
    
        pagination.appendChild(nav);
    }

    filterButton.addEventListener("click", () => {
        timeFilterModal.classList.toggle("hidden");
    });

    applyFilter.addEventListener("click", () => {
        const startDate = startDateInput.value;
        console.log(`Áp dụng bộ lọc từ ${startDate}`);
    
        timeFilterModal.classList.add("hidden"); 
    });

    // Đóng modal
    closeModal.addEventListener("click", () => {
        timeFilterModal.classList.add("hidden");
    });

    searchInput.addEventListener("input", () => {
        curPage = 1;
        renderList();
    });

    renderList();
});