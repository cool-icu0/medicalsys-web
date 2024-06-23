<template>
	<div>
		<div class="search" style="text-align: center; margin: auto;margin-bottom: 10px;">
			药品查询：
			<el-input style="width: 500px;" placeholder="药品名称" v-model="searchkey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
		</div>
		<!-- 药品弹窗 -->
		<el-dialog title="购买信息" :visible.sync="dialogVisible" width="50%">
			<el-form :model="medicineForm" :rules="rules" ref="refMedicineForm">
				<el-row :gutter="10">
					<el-col :span="8">
						<div class="grid-content"><el-form-item label="药品名称" prop="medicineName">
								<el-input v-model="medicineForm.medicineName" disabled></el-input>
							</el-form-item></div>
					</el-col>
					<el-col :span="8">
						<div class="grid-content"><el-form-item label="生产厂家" prop="manufacturer">
								<el-input v-model="medicineForm.manufacturer" disabled></el-input>
							</el-form-item></div>
					</el-col>
					<el-col :span="8">
						<div class="grid-content"><el-form-item label="单价" prop="unitPrice">
								<el-input v-model="medicineForm.unitPrice" disabled></el-input>
							</el-form-item></div>
					</el-col>
				</el-row>
				<el-row :gutter="10">
					<el-col :span="8">
						<el-form-item label="药品序号" prop="medicineId">
							<el-input v-model="medicineForm.medicineId" style="width: 150px;" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="余量" prop="quantity">
							<el-input v-model="medicineForm.quantity" style="width: 180px;" disabled></el-input>
						</el-form-item>
					</el-col>
					<el-col :span="8">
						<el-form-item label="购买数量" prop="q">
							<el-input-number v-model="medicineForm.q" controls-position="right" @change="handleChange"
								:min="1" :max="100"></el-input-number>
						</el-form-item>
					</el-col>
				</el-row>

				<el-form-item label="药品功效" prop="description">
					<el-input type="textarea" :rows="2" v-model="medicineForm.description" disabled></el-input>
				</el-form-item>
				<el-form-item prop="imgUrl">
				</el-form-item>


			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="Buy()">确 定</el-button>
			</span>
		</el-dialog>

		<div class="card">
			<el-table :data="medicinesCompute" style="width: 100%;text-align: center;margin: auto;" stripe
				@sort-change="handleSortChange">
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
						<el-button plain type="primary" @click="upwindow(scope.row)" size="mini"
						:disabled="scope.row.quantity == 0?true:false">购买</el-button>
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
				dialogVisible: false,
				medicines: [],
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				medicineForm: {
					medicineName: '',
					manufacturer: '',
					quantity: '',
					unitPrice: '',
					description: '',
					q: '',
					medicineId: '',
					imgUrl: '',
					medicationGuide: '',
				},
				rules: {
					q: [{
							required: true,
							message: '请输入购买数量',
							trigger: 'blur'
						},
						{
							type: 'number',
							min: 1,
							message: '购买数量最少为1',
							trigger: 'change'
						}
					]
				},
			};
		},
		mounted() {
			this.fetchMedicines();
		},
		computed: { //替换表名
			medicinesCompute: function() { //通过什么查询
				return this.medicines.filter(item => {
					return item.medicineName.includes(this.searchkey)
				})
			} //所有数据存的地方
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
			handleChange(value) {
				console.log(value);
			},
			// Buy() {
			// 	// 表单提交逻辑
			// 	this.$refs['refMedicineForm'].validate((valid) => {
			// 		if (valid) {
			// 			// 获取当前账号的id
			// 			// let accountId = JSON.parse(localStorage.getItem("xm-user")).userId;
			// 			let formData = this.medicineForm;
			// 			formData.uid = JSON.parse(localStorage.getItem("xm-user")).userId;
			// 			formData.url = "https://www.ele.me/"
			// 			window.open('http://47.98.213.9:8039/api/v1/pay/toAliPay?' + new URLSearchParams(formData)
			// 				.toString())
			// 			// 发送GET请求		      
			// 			//     axios({
			// 			//     	url: ',
			// 			//     	method: 'get',
			// 			//     	headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
			// 			//     }).then(response => {
			// 			//     	// your logic processing response
			// 			// console.log(response.data);
			// 			//     }, error => {
			// 			//     	// your logic dealing with error
			// 			//     })
			// 			// } else {
			// 			//   console.log('表单验证失败');
			// 			//   return false;
			// 			//   }
			// 			// });
			// 		}
			// 	})
			// },
			Buy() {
				this.$refs['refMedicineForm'].validate((valid) => {
					if (valid) {
						// 计算 medicationGuide 的值  
						this.medicineForm.medicationGuide = this.medicineForm.medicineName + 'x' + this
							.medicineForm.q + '；';

						const userId = JSON.parse(localStorage.getItem("xm-user")).userId;
						const currentTime = new Date().toISOString().slice(0, 10); // 年月日，格式为 YYYY-MM-DD  

						// 准备发送到服务器的数据  
						const formData = {
							userId,
							medicationGuide: this.medicineForm.medicationGuide,
							status: '未受理', // 状态信息  
							date: currentTime,
						};

						// 发送 POST 请求到处方接口  
						this.$request.post('/api/v1/prescription/insertPrescription', formData)
							.then(response => {
								// 处理成功的响应  
								this.$message.success('处方审核中')
								console.log('处方插入成功:', response.data);
								this.dialogVisible = false; // 关闭对话框  
								this.load()
							})
							.catch(error => {
								// 处理错误  
								console.error('处方插入失败:', error);
								// 显示错误消息给用户...  
							});
					} else {
						console.log('表单验证失败');
					}
				});
			},
			upwindow(row) {
				this.medicineForm = JSON.parse(JSON.stringify(row))
				this.dialogVisible = true
			},
			reset() {
				this.nameSearchKey = ''
				this.departmentSearchKey = ''
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/medicine/selectAllMedicine', {
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
			handleUploadSuccess(response) {
				if (response.code === 200) {
					this.medicineForm.imgUrl = response.data;
				} else {
					this.$message.error(response.msg);
				}
			},
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

	.bg-purple-dark {
		background: #99a9bf;
	}

	.bg-purple {
		background: #d3dce6;
	}

	.bg-purple-light {
		background: #e5e9f2;
	}

	.grid-content {
		border-radius: 4px;
		min-height: 36px;
	}

	.row-bg {
		padding: 10px 0;
		background-color: #f9fafc;
	}
</style>