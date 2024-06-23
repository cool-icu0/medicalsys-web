<template>
	<div>
		<!-- 药品弹窗 -->
		<el-dialog title="药品信息" :visible.sync="dialogVisible" width="50%">
			<el-form :model="medicineForm">
				<el-row :gutter="10">
					<el-col :span="12"><el-form-item label="药品名称" prop="medicineName">
							<el-input v-model="medicineForm.medicineName"></el-input>
						</el-form-item></el-col>
					<el-col :span="12"><el-form-item label="生产厂家" prop="manufacturer">
							<el-input v-model="medicineForm.manufacturer"></el-input>
						</el-form-item></el-col>
				</el-row>
				<el-row :gutter="10">
					<el-col :span="12"><el-form-item label="数量" prop="quantity">
							<el-input v-model="medicineForm.quantity"></el-input>
						</el-form-item></el-col>
					<el-col :span="12"><el-form-item label="单价" prop="unitPrice">
							<el-input v-model="medicineForm.unitPrice"></el-input>
						</el-form-item></el-col>
				</el-row>
				<el-form-item label="效果描述" prop="description">
					<el-input type="textarea" v-model="medicineForm.description"></el-input>
				</el-form-item>
				<el-form-item label="商品样例" prop="imgUrl">
					<!-- 
				:auto-upload="false" 表示文件选择后不自动上传，等待用户点击上传按钮。
				:before-upload="beforeUpload" 是一个钩子，在文件上传之前调用，用于文件类型和大小的校验。
				:on-success="handleUploadSuccess" 是一个钩子，在文件上传成功时调用，用于处理服务器返回的响应。
				-->
					<el-upload ref="upload" class="avatar-uploader"
						action="http://localhost:8039/api/v1/file/updateMedicine" :before-upload="beforeUpload"
						:on-success="handleUploadSuccess" :show-file-list="false" :auto-upload="false">
						<img v-if="medicineForm.imgUrl" :src="medicineForm.imgUrl" alt="药品图片"
							style="width: 100px; height: auto;">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
						<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="save()">确 定</el-button>
			</span>
		</el-dialog>

		<!-- 添加药品按钮 -->
		<div class="search" style="margin-bottom: 20px;">
			<el-row>
				<el-col :span="12">
					<div class="grid-content bg-purple" style="text-align: center; margin: auto"><el-button
							type="primary" @click="handleAdd()">添加药品</el-button></div>
				</el-col>
				<el-col :span="12">
					<div class="grid-content bg-purple-light">
						药品查询：
						<el-input style="width: 500px;" placeholder="药品名称" v-model="searchkey"></el-input>
						<!-- <el-button @click="searchMedicine" style="margin-left: 10px;">查询</el-button> -->
					</div>
				</el-col>
			</el-row>
		</div>

		<!-- 药品展示表格 -->
		<div class="card">
			<el-table :data="medicinesCompute" style="width: 100%" @sort-change="handleSortChange">
				<el-table-column prop="medicineId" label="序号"></el-table-column>
				<el-table-column prop="medicineName" label="药品名称" sortable></el-table-column>
				<el-table-column prop="manufacturer" label="生产厂家"></el-table-column>
				<el-table-column prop="imgUrl" label="商品图片">
					<template v-slot:default="scope">
						<div style="text-align: center; width: 120px;">
							<img :src="scope.row.imgUrl" alt="照片"
								style="width: 100px; height: 100px; margin: auto; display: block;">
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="unitPrice" label="单价"></el-table-column>
				<el-table-column prop="quantity" label="数量"></el-table-column>
				<el-table-column prop="description" label="药品功效"></el-table-column>
				<el-table-column label="操作" width="180" align="center">
					<template v-slot="scope">
						<el-button plain type="primary" @click="editMedicine(scope.row)" size="mini">编辑</el-button>
						<el-button plain type="danger" size="mini" @click="deleteMedicine(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script>
	import axios from 'axios'; // 引入axios
	export default {
		data() {
			return {
				searchkey: '',
				insertFlag: true,
				dialogVisible: false,
				medicines: [],
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				medicineForm: {
					medicineId: '',
					medicineName: '',
					manufacturer: '',
					quantity: '',
					unitPrice: '',
					description: '',
					imgUrl: '',
				},
				dialogVisible: false, // 控制药品弹窗的可见性  
				largeImageSrc: '', // 用于存储大图的URL  
			};
		},
		computed: { //替换表名
			medicinesCompute: function() { //通过什么查询
				return this.medicines.filter(item => {
					return item.medicineName.includes(this.searchkey)
				})
			} //所有数据存的地方
		},
		mounted() {
			this.fetchMedicines();
		},
		methods: {
			fetchMedicines() {
				this.$request.get(`/api/v1/medicine/allMedicinePager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.medicines = res.data?.list
						this.total = res.data?.total
					})
			},
			handleSortChange({
				column,
				prop,
				order
			}) {
				// 处理排序逻辑
				console.log(column, prop, order);
			},

			handleAdd() {
				this.medicineForm = {}
				this.dialogVisible = true
			},
			editMedicine(row) {
				this.medicineForm = JSON.parse(JSON.stringify(row))
				this.dialogVisible = true
			},
			save() {
				// 构造FormData对象，用于包含文件和其他表单数据  
				let formData = new FormData();

				// 添加其他药品信息到formData中  
				if (this.medicineForm.medicineId) {
					formData.append('medicineId', this.medicineForm.medicineId); // 只有当编辑现有记录时才需要id  
				}
				formData.append('medicineName', this.medicineForm.medicineName);
				formData.append('manufacturer', this.medicineForm.manufacturer);
				formData.append('quantity', this.medicineForm.quantity);
				formData.append('unitPrice', this.medicineForm.unitPrice);
				formData.append('description', this.medicineForm.description);
				// 检查是否有文件被选中
				if (this.$refs.upload && this.$refs.upload.uploadFiles && this.$refs.upload.uploadFiles.length > 0) {
					// 有文件被选中，则添加到formData中  
					formData.append('file', this.$refs.upload.uploadFiles[0].raw); // 后端接收的字段名为'file'  
				} else {
					formData.append('imgUrl', this.medicineForm.imgUrl);
				}

				axios.post(this.medicineForm.medicineId ? 'http://localhost:8039/api/v1/file/updateMedicine' :
					'http://localhost:8039/api/v1/file/insertMedicine', formData, {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					}).then(response => {
					if (response.data.code == 200) {
						this.$message.success('保存成功')
						this.dialogVisible = false
						this.fetchMedicines()
					}
				}).catch(error => {
					console.error('上传失败', error);
				});
			},
			handleUploadSuccess(response) {
				if (response.code === 200) {
					this.medicineForm.imgUrl = response.data;
				} else {
					this.$message.error(response.msg);
				}
			},
			beforeUpload(file) {
				const isJPG = file.type === 'image/jpeg';
				const isPNG = file.type === 'image/png';
				const isLt2M = file.size / 1024 / 1024 < 0.5;

				if (!isJPG && !isPNG) {
					this.$message.error('上传图片只能是 JPG/PNG 格式!');
					return false;
				}
				if (!isLt2M) {
					this.$message.error('上传图片大小不能超过 500KB!');
					return false;
				}
				return true;
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/medicine/allMedicinePager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.medicines = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			deleteMedicine(dmedicine) {}
		}
	};
</script>

<style scoped>
	.el-row {
		margin-bottom: 20px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	.el-col {
		border-radius: 4px;
	}
</style>