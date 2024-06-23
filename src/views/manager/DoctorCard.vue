<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入姓名查询" style="width: 200px; margin-right: 20px;"
				v-model="nameSearchKey"></el-input>
			<el-input placeholder="请输入科室查询" style="width: 200px" v-model="departmentSearchKey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset()">重置</el-button>
			<el-button type="warning" plain style="margin-left: 10px" @click="showPriceDialog = true">问诊价格详情</el-button>
			<el-button type="warning" plain style="margin-left: 10px" v-if="user.role=='ADMIN'"
				@click="drawerVisible = true">更新问诊价格</el-button>
		</div>

		<div class="table">
			<el-table :data="doctorsCompute" strip @selection-change="handleSelectionChange" stripe>
				<el-table-column prop="id" label="医生ID"></el-table-column>
				<el-table-column prop="imgUrl" label="照片">
					<template v-slot:default="scope">
						<div style="text-align: center; width: 100px;">
							<img :src="scope.row.imgUrl" alt="照片"
								style="width: 100px; height: 100px; margin: auto; display: block;">
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="doctorName" label="姓名"></el-table-column>
				<el-table-column prop="specialty" label="特长" show-overflow-tooltip></el-table-column>
				<el-table-column prop="hospitalName" label="所属医院"></el-table-column>
				<el-table-column prop="department" label="科室"></el-table-column>
				<el-table-column prop="position" label="职位"></el-table-column>
				<el-table-column prop="experienceYears" label="任职时长(年)"></el-table-column>
				<el-table-column prop="introduction" label="医生介绍" show-overflow-tooltip></el-table-column>
				<el-table-column label="角色">
					<template v-slot="scope">
						{{scope.row.role==1?'医生':'药剂师'}}
					</template>
				</el-table-column>
				<el-table-column prop="isDelete" label="是否在岗">
					<template v-slot="scope">
						{{scope.row.isDelete==0?'在岗':'离职'}}
					</template>
				</el-table-column>
				<el-table-column label="操作" align="center" width="180">
					<template v-slot="scope">
						<el-button size="mini" type="primary" plain @click="handleReserve(scope.row)">预约</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
			<el-dialog :visible.sync="showPriceDialog" title="问诊价格详情">
				<div class="search" style="margin-bottom: 10px;">
					<el-input placeholder="请输入职称查询" style="width: 200px; margin-right: 20px;"
						v-model="searchPosition"></el-input>
					<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
				</div>
				<el-table :data="positionCompute" style="width: 100%;">
					<el-table-column prop="id" label="ID"></el-table-column>
					<el-table-column prop="position" label="职位"></el-table-column>
					<el-table-column prop="price" label="价格"></el-table-column>
				</el-table>
				<div class="pagination">
					<el-pagination background @current-change="handleCurrentChangeP" :current-page="pageNum"
						:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next"
						:total="total">
					</el-pagination>
				</div>
			</el-dialog>
		</div>


		<el-dialog title="预约信息" :visible.sync="fromVisible">
			<el-form :model="formData">
				<el-row :gutter="10">
					<el-col :span="8">
						<div class="grid-content bg-purple">
							<el-form-item label="患者ID">
								<el-input v-model="formData.userId" disabled></el-input>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="8">
						<div class="grid-content bg-purple">
							<el-form-item label="医生ID">
								<el-input v-model="formData.doctorId" disabled></el-input>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="8">
						<div class="grid-content bg-purple">
							<el-form-item label="科室">
								<el-input v-model="formData.hospitalDepartment" disabled></el-input>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
				<el-row :gutter="10">
					<el-col :span="10">
						<div class="grid-content bg-purple">
							<el-form-item label="挂号时间">
								<el-date-picker v-model="formData.appointmentDate" type="datetime" placeholder="选择日期时间">
								</el-date-picker>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="10">
						<div class="grid-content bg-purple-light">
							<el-form-item label="支付费用">
								<el-input-number v-model="formData.appPrices" :min="0" controls-position="right"
									disabled></el-input-number>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="fromVisible = false">取 消</el-button>
				<el-button type="primary" @click="save()">确 定</el-button>
			</div>
		</el-dialog>
		<!-- 新增问诊价格 -->
		<el-drawer :visible.sync="drawerVisible" :direction="direction" class="drawer">
			<div class="drawer-header">
				<h3>更新问诊价格</h3>
			</div>
			<div class="drawer-content">
				<el-form :model="newPrice" ref="priceForm" label-width="120px">
					<el-form-item label="职位" prop="position">
						<el-input v-model="newPrice.position"></el-input>
					</el-form-item>
					<el-form-item label="价格" prop="price">
						<el-input-number v-model="newPrice.price" :min="0" precision="2"></el-input-number>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitPriceForm('priceForm')">提交</el-button>
						<el-button @click="drawerVisible = false">取消</el-button>
					</el-form-item>
				</el-form>
				<div v-if="editMode" class="drawer-content edit-price-form card" style="margin-bottom: 10px;">
					<el-form :model="editPriceForm" ref="editPriceForm" label-width="120px">
						<el-form-item label="id" prop="id">
							<el-input v-model="editPriceForm.id" disabled></el-input>
						</el-form-item>
						<el-form-item label="职位" prop="position">
							<el-input v-model="editPriceForm.position"></el-input>
						</el-form-item>
						<el-form-item label="新价格" prop="price">
							<el-input-number v-model="editPriceForm.price" :min="0" precision="2"></el-input-number>
						</el-form-item>
						<el-form-item>
							<el-button type="primary" @click="updatePrice">提交</el-button>
							<el-button @click=" editMode = false;">取消</el-button>
						</el-form-item>
					</el-form>
				</div>
				<hr />
				<div class="search" style="margin-bottom: 10px;">
					<el-input placeholder="请输入职称查询" style="width: 200px; margin-right: 20px;"
						v-model="searchPosition"></el-input>
					<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
				</div>
				<el-table :data="positionCompute" style="width: 100%;">
					<el-table-column prop="id" label="ID"></el-table-column>
					<el-table-column prop="position" label="职位"></el-table-column>
					<el-table-column prop="price" label="价格"></el-table-column>
					<el-table-column label="操作" v-if="user.role == 'ADMIN'">
						<template slot-scope="scope">
							<el-button @click="editPrice(scope.row)">编辑</el-button>
						</template>
					</el-table-column>
				</el-table>
				<el-pagination background layout="prev, pager, next" :total="totalItems" :current-page="currentPage"
					:page-size="pageSize" @current-change="fetchData"></el-pagination>
			</div>
		</el-drawer>
	</div>
</template>
<script>
	export default {
		name: "Department",
		data() {
			return {
				direction: 'ltr',
				drawerVisible: false,
				newPrice: { //新增问诊价格
					position: '',
					price: 0
				},
				title: null,
				showPriceDialog: false,
				tableDataP: [], //问诊价格
				totalItems: 0,
				currentPage: 1,
				searchPosition: '', // 用于查询的职位
				nameSearchKey: '',
				departmentSearchKey: '',
				tableData: [], // 预约医生数据
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				name: null,
				fromVisible: false,
				form: {},
				formData: { //预约表单
					id: null,
					userId: '',
					doctorId: '',
					hospitalDepartment: '',
					appointmentDate: '',
					appPrices: 0,
					isComplete: 0,
				},
				doctorForm: {
					department: '',
					doctorName: '',
					experienceYears: '',
					hospitalName: '',
					id: '',
					introduction: '',
					isDelete: '',
					integer: '',
					position: '',
					string: '',
					role: '',
					specialty: '',
				},
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				editMode: false, // 控制编辑价格表单的显示  
				editPriceForm: {},
				rules: {
					name: [{
						required: true,
						message: '请输入科室名称',
						trigger: 'blur'
					}, ],
				},
				ids: []
			}
		},
		mounted() {
			this.fetchDepartment();
			this.fetchPriceData();
		},
		computed: {
			doctorsCompute: function() {
				if (this.tableData.length > 0) {
					return this.tableData.filter(item => {
						return !item.isDelete && // 过滤掉isDelete为1的行  
							item.doctorName.includes(this.nameSearchKey) &&
							item.department.includes(this.departmentSearchKey);
					});
				} else {
					return [];
				}
			},
			positionCompute: function() {
				if (this.tableDataP.length > 0) {
					return this.tableDataP.filter(item => {
						return item.position.includes(this.searchPosition)
					})
				} else {
					return []
				}
			},
		},
		methods: {
			fetchDepartment() {
				this.$request.get(`/api/v1/doctor/allDoctorInfoPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.tableData = res.data?.list
						this.total = res.data?.total
					})
			},
			fetchPriceData(pageNum) {
				this.$request.get(
					`/api/v1/conPrice/allConsultationPricePager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`, {
						params: {
							position: this.searchPosition // 按职位搜索参数  
						}
					}).then(response => {
					console.log(response);
					this.tableDataP = response.data?.list;
					this.totalItems = response.data?.total;
				}).catch(error => {
					console.error(error);
				});
			},
			getPrice(position) { // 查询价格
				// 使用Promise.resolve来包装this.$request.get的返回值，确保getPrice返回一个Promise  
				return new Promise((resolve, reject) => {
					// 使用模板字符串替换来构造URL  
					const url = `/api/v1/conPrice/selectConsultationPriceByPosition/` + position;
					this.$request.get(url)
						.then(response => {
							resolve(response.data); // 使用resolve来返回数据  
						}).catch(error => {
							console.error('查询价格失败:', error); // 添加错误处理  
							reject(error); // 使用reject来传递错误  
						});
				});
			},
			handleReserve(row) {
				this.doctorForm = { // 更新doctorForm对象预约
					department: row.department,
					doctorName: row.doctorName,
					experienceYears: row.experienceYears,
					hospitalName: row.hospitalName,
					position: row.position,
					id: row.id,
					introduction: row.introduction,
					role: row.role,
					specialty: row.specialty,
				};
				// 返回一个Promise，解析为包含价格的对象
				this.getPrice(row.position)
					.then(priceData => {
						this.formData = { // 更新formData对象
							id: null,
							userId: this.user.userId || '',
							doctorId: row.id,
							hospitalDepartment: row.department, // 获取科室信息  
							appointmentDate: '', // 挂号时间 
							appPrices: priceData[0].price, // 取priceData的列表对象，包含一个price字段  
							isComplete: 0,
						};
						this.fromVisible = true; // 打开弹窗 
					}).catch(error => {
						console.error('获取问诊价格失败:', error);
						this.formData.appPrices = 0; // 默认的价格  
						this.fromVisible = true;
					});
			},
			save() {
				this.fromVisible = false
				this.confirmPaymentAndRedirect();
			},
			confirmPaymentAndRedirect() {
				this.$confirm('若支付成功，医生受理后则可前往手机端进行问诊', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					// 用户点击了确定按钮，执行页面跳转  
					let formDoctor = this.doctorForm;
					formDoctor.uid = JSON.parse(localStorage.getItem("xm-user")).userId;
					formDoctor.url = "http://localhost:5173/doctorCard";
					window.location.href = "http://47.98.213.9:8039/api/v1/pay/toAliPay2?" + new URLSearchParams(
						formDoctor).toString();
				}).catch(() => {
					// 用户点击取消按钮，不执行任何操作  
				});
			},
			editPrice(row) {
				this.editMode = true;
				this.editPriceForm = JSON.parse(JSON.stringify(row))
			},
			updatePrice() {
				// 发送POST请求到后端接口来更新价格  
				this.$request.post('/api/v1/conPrice/updateConsultationPrice', this.editPriceForm).then(response => {
					if (response.code === 200) {
						this.$message.success('价格更新成功');
						this.fetchPriceData();
						this.editMode = false;
					} else {
						this.$message.error(response.msg);
					}
				}).catch(error => {
					console.error('更新价格失败:', error);
					this.$message.error('更新价格时发生错误');
				});
			},
			handleSelectionChange(rows) { // 当前选中的所有的行数据
				this.ids = rows.map(v => v.id) // [1,2]
			},
			reset() {
				this.nameSearchKey = ''
				this.departmentSearchKey = ''
				this.searchPosition = ''
			},
			submitPriceForm(newPrice) {
				this.$refs[newPrice].validate((valid) => {
					if (valid) {
						this.$request.post('/api/v1/conPrice/insertConsultationPrice', this.newPrice)
							.then(response => {
								this.$message({
									message: '新增成功',
									type: 'success'
								});
								this.addPriceDialogVisible = false;
								this.fetchPriceData();
							})
							.catch(error => {
								console.error(error);
								this.$message({
									message: '新增失败',
									type: 'error'
								});
							});
					} else {
						console.log('表单验证失败!');
						return false;
					}
				});
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/doctor/allDoctorInfoPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			loadPrice(pageNum) {
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/conPrice/allConsultationPricePager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableDataP = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			handleCurrentChangeP(pageNum) {
				this.loadPrice(pageNum)
			},
			handleUploadSuccess(response) {
				if (response.code === 200) {
					this.medicineForm.imgUrl = response.data;
				} else {
					this.$message.error(response.msg);
				}
			},
		}
	}
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

	.grid-content {
		border-radius: 4px;
		min-height: 36px;
	}

	.drawer {
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		overflow: auto;
		/* 确保内容过多时可以滚动 */
	}

	.drawer-header {
		padding: 15px;
		background-color: #f5f7fa;
		/* 浅灰色背景 */
		border-bottom: 1px solid #ebeef5;
		/* 下边框 */
		display: flex;
		justify-content: space-between;
		/* 标题和可能的关闭按钮之间的间距 */
		align-items: center;
	}

	.drawer-header h3 {
		margin: 0;
		/* 移除标题的默认外边距 */
		font-size: 16px;
		/* 标题字体大小 */
		font-weight: bold;
		/* 加粗标题 */
	}

	.drawer-content {
		padding: 20px;
		/* 内容区域的内边距 */
	}

	.drawer .el-form-item {
		margin-bottom: 20px;
		/* 表单项之间的间距 */
	}

	.drawer .el-form-item__label {
		font-weight: bold;
		/* 表单项标签加粗 */
	}

	.drawer .el-button {
		margin-right: 10px;
		/* 提交和取消按钮之间的间距 */
	}
</style>