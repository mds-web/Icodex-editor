import { getAllProjects, addProject } from '../util/db.js';

import { Button } from './Button.js';
import { TreeView } from './TreeView.js';
import { Input } from './Input.js';
import { Dialog } from './Dialog.js';
const dialogWrap = window.Icodex.dialog_containers;
document.body.appendChild(dialogWrap)


window.isTreeViewReady = false;


export class CustomDialog extends Dialog {
  constructor(option = { title: "Berkas Baru", placeholder: "Masukan Nama atau Path" }, container) {
    super(option.title,container); // Lewatkan judul ke konstruktor Dialog
    this._container = container
    this.option = option;
    this.input = new Input(this.option.placeholder);
    
  this.#initCustomDialog(); // Method inisialisasi khusus untuk CustomDialog
    
      }
  get value() {
    return this.input.value
  }
  set value(val) {
    return this.input.value = val;
  }
  
  focus() {
     this.input.focus()
  }
  
  blur() {
     this.input.blur()
  }
  
  
  //renameFolder.input
  
  #initCustomDialog() {
    
    // Buat tombol di sini
    const buttonNegative = new Button("btn button-negative", "Membatalkan");
    const buttonPositive = new Button("btn button-positive", "Buat");
  this.buttonPositive = buttonPositive; 
  this.buttonNegative = buttonNegative;
  // ✅ Simpan referensi

    // Gunakan Proxy children yang sudah ada dari Dialog
    this.children.body.push(this.input.input);
    this.children.footer.push(buttonNegative.button);
    this.children.footer.push(buttonPositive.button);
   
 
}
  
  // Method 'render' CustomDialog tidak lagi perlu mengulang init DOM dasar
  // Method ini bisa digunakan untuk menampilkan atau menyembunyikan dialog
  show(state = false) {
     if (state) {
       
       if (!this.dialog.isConnected && this._container) {
         this.render(true)
        
       }
       this.dialog.classList.add('open');
       this.input.focus();
     } else {
       this.dialog.classList.remove('open');
      setTimeout(() => this.render(false), 300)
     }
    
  }
  
}






export default class Drawer {
  #drawerClass = "file_exploler-drawer";
#createNewProjectBtn = new Button('btn', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`); 
  #createNewFolderBtn = new Button('btn', `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19h-7a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v3.5" /><path d="M16 19h6" /><path d="M19 16v6" /></svg>`);
  #createNewFileBtn = new Button('btn', `<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
  <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
  <path d="M12 11l0 6" />
  <path d="M9 14l6 0" />
</svg>
`);
  


  
  //#treeView = new TreeView(container[0].children); // karena container root berisi children berupa projects
  #treeView = new TreeView([]); // kosong awalnya

  
  
  
  constructor() {
    this.folderList = [];
    this.drawer = document.createElement('aside');
    this.drawer.className = this.#drawerClass;
    this.drawer.id="explorer"
        this.#init()
    this.#initDialog()
    this.#refreshTreeViewFromDb();
    
  }
  
  
  
  
  #init() {
  const drawer_header = document.createElement('div');
  
drawer_header.className = "drawer-header";

this.drawer.appendChild(drawer_header);
const drawer_header_tools = document.createElement('nav');
    drawer_header_tools.className = "drawer-tool";
    
     
    drawer_header.append(drawer_header_tools);
    

    
  drawer_header_tools.appendChild(this.#createNewProjectBtn.button);
  


    
    this.drawer.appendChild(this.#treeView.renderTree())
    
    this.drawer.translate = false;
    
    
    
    
  }
  
  #initDialog() {
  
   
 const dialogProject = new CustomDialog({
   title: "Project Baru",
   placeholder: "Masukan Nama Project"
 },dialogWrap);
 

this.#createNewProjectBtn.setOnclickListener(() => {
  
  dialogProject.show(true);
});


dialogProject.buttonPositive.button.addEventListener("click", async () => {
  const name = dialogProject.input.value.trim();
  if (!name) return;

  const newProject = {
    kind: "directory",
    name: name,
    children: []
  };

  await addProject(newProject); // menggunakan fungsi dari db.js
  dialogProject.show(false);
  
  await this.#refreshTreeViewFromDb();
});




   

    
    //fungsi untuk tombol² didalam dialog    
    
    
    
    
  };
  
/* async #refreshTreeViewFromDb() {
  const projects = await getAllProjects(); // Ambil dari IndexedDB
  Object.defineProperties(Icodex, {
    getAllProjects: {
      value: projects,
      writable: false
    }
  });

  const oldTree = this.drawer.querySelector('.tree-view');
  if (oldTree) oldTree.remove();

  this.#treeView = new TreeView(projects);
  this.drawer.appendChild(this.#treeView.renderTree());
  
  //console.log("Data dari DB:", projects);
  // Menambahkan Dummy




}*/
 
  async #refreshTreeViewFromDb() {
  const projects = await getAllProjects();

  const oldTree = this.drawer.querySelector('.tree-view');
  if (oldTree) oldTree.remove();

  const worker = new Worker('workers/treeWorkers.js');
  console.log("%c [Main] Mengirim data ke worker:",'color: #22c55e; font-weight: 500;', projects);

  worker.postMessage(projects);

  worker.onmessage = (event) => {
    if (event.data.type === "log") {
      console.log("%c [Worker LOG]", "color: #14b8a6; font-weight: 500", event.data.message, event.data.data);
    } else if (event.data.type === "result") {
      const treeData = event.data.data;
      
      // Simpan ke global window agar bisa digunakan di mana saja
      
  

      this.#treeView = new TreeView(treeData);
      this.drawer.appendChild(this.#treeView.renderTree());
window.treeView = this.#treeView;
window.isTreeViewReady = true;

window.dispatchEvent(new CustomEvent("treeViewReady", {
  detail: { treeView: window.treeView }
  
}));

      worker.terminate();
    }
  };

  worker.onerror = (err) => {
    console.error("%c [Main] Terjadi error pada worker:", 'color: crimson', err);
    this.#treeView = new TreeView(projects);
    this.drawer.appendChild(this.#treeView.renderTree());
  };
}

  
}; // end class drawer


//inisialisasi 
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM siap. Menambahkan drawer...");
  const drawerLeft = new Drawer()
  console.log("Drawer dibuat:", drawerLeft);
  document.body.appendChild(drawerLeft.drawer);
});





window.findNodeByPathAsync = function(path, callback) {
  if (window.isTreeViewReady && window.treeView) {
    const node = window.treeView.getNodeByPath(path);
    return callback(node);
  }

  // Dengarkan event hanya sekali
  window.addEventListener("treeViewReady", () => {
    const node = window.treeView.getNodeByPath(path);
    callback(node);
  }, { once: true });
};
window.findNodeByPathAsync("MyProject", (node) => {
  console.log("Node ditemukan:", node);
});












