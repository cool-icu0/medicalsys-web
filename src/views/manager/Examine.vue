<template>
	<div>
		<el-dialog title="处方信息" :visible.sync="dialogVisible" width="50%">
			<el-form :model="prescriptionForm" :rules="rules" ref="prescriptionFormRef">
				<el-form-item label="处方" prop="medicationGuide">
					<el-input type="textarea" :rows="4" v-model="prescriptionForm.medicationGuide"
						placeholder="药名x数量，如：感冒灵x10;消炎药x5;"></el-input>
				</el-form-item>
				<el-row :gutter="10">
					<el-col :span="8"><el-form-item label="状态" prop="status">
							<el-input v-model="prescriptionForm.status" :disabled="true"
								placeholder="默认为未受理"></el-input>
						</el-form-item></el-col>
					<el-col :span="8"><el-form-item label="用户ID" prop="userId">
							<el-input v-model="prescriptionForm.userId" placeholder="处方受理用户"></el-input>
						</el-form-item></el-col>
					<el-col :span="8"><el-form-item label="申请时间" prop="createTime">
							<el-date-picker type="date" v-model="prescriptionForm.createTime"></el-date-picker>
						</el-form-item></el-col>
				</el-row>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="insertFlag?addPrescription():submitPrescription()">确 定</el-button>
			</span>
		</el-dialog>

		<div class="search" style="margin-bottom: 20px;">
			<el-row :gutter="10">
				<el-col :span="12">
					<div class="grid-content bg-purple-light">
						<el-input style="width: 500px;" placeholder="请输入用户ID查询" v-model="searchkey"></el-input>
					</div>
				</el-col>
				<el-col span="12">
					<div>
						<el-button type="primary" plain @click="insertPrescription();" v-if="userRole =='DOCTOR'">新增处方</el-button>
					</div>
				</el-col>
			</el-row>
		</div>

		<div class="table">
			<el-table :data="prescriptionCompute" style="width: 100%" @sort-change="handleSortChange">
				<el-table-column prop="id" label="处方ID" width="80"></el-table-column>
				<el-table-column prop="userId" label="用户ID" width="80"></el-table-column>
				<el-table-column prop="medicationGuide" label="处方"></el-table-column>
				<el-table-column :formatter="formatDate" prop="createTime" label="申请时间"></el-table-column>
				<el-table-column prop="status" label="状态"></el-table-column>
				<el-table-column label="操作" width="300" align="center" v-if="userRole =='PHARMACIST'">
					<template v-slot="scope">
						<el-button plain type="primary" @click="deletePrescription(scope.row)" size="mini"
							:disabled="scope.row.status =='未受理'?false:true">退回</el-button>
						<el-button plain type="primary" @click="agree(scope.row)" size="mini"
							:disabled="scope.row.status =='未受理'?false:true">受理</el-button>
						<el-button plain type="primary" @click="select(scope.row)" size="mini"
							:disabled="scope.row.status =='未受理'?false:true">用户过敏史</el-button>
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
	export default {
		data() {
			return {
				searchkey: '',
				insertFlag: true,
				dialogVisible: false,
				prescription: [],
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				userRole: JSON.parse(localStorage.getItem('xm-user') || '{}').role,
				prescriptionForm: {
					createTime: '',
					medicationGuide: '',
					status: '未受理', // 默认为未受理  
					userId: '',
				},
				rules: {
					medicationGuide: [{
						required: true,
						message: '请输入处方',
						trigger: 'blur'
					}],
					userId: [{
						required: true,
						message: '请输入受理用户ID',
						trigger: 'blur'
					}],
				},
			};
		},
		computed: {
			prescriptionCompute: function() {
				return this.prescription.filter(item => {
					return ("" + item.userId).includes(this.searchkey)
				})
			}
		},
		mounted() {
			this.fetchPrescription();
		},
		methods: {
			fetchPrescription() {
				this.$request.get(
						`/api/v1/prescription/allPrescriptionPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.prescription = res.data?.list
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
			insertPrescription() {
				this.prescriptionForm = {}
				this.dialogVisible = true
				this.insertFlag = true
			},
			addPrescription() {
				// this.$refs['formRef'].validate((valid) => {
				//   if (valid) {
				this.$request.post('/api/v1/prescription/insertDocPrescription', this.prescriptionForm).then(res => {
					if (res.code == 200) {
						this.$message.success('插入成功')
						this.dialogVisible = false
						this.fetchPrescription();
					} else {
						this.$message.error(res.msg)
					}
				})
				// }
				// })
			},
			deletePrescription(row) {
				this.$request.get('/api/v1/prescription/unAuthorize', {
					params: {
						id: row.id,
						userid: this.user.userId
					}
				}).then(res => {
					if (res.code == 200) {
						this.$message.success('退回成功')
						this.fetchPrescription()
						this.dialogVisible = false
					} else {
						this.$message.error(res.msg)
					}
				})

			},
			agree(prescription) {
				// 发送处方ID给后端进行受理和发送邮件操作  
				this.$request.get('/api/v1/email/send1?id=' + prescription.id, )
					.then(res => {
						if (res.code === 0) {
							this.$message.success('处方已受理，邮件已发送');
							this.fetchPrescription()
						} else {
							this.$message.error('受理处方或发送邮件失败: ' + res.msg);
						}
					})
					.catch(error => {
						console.error('请求失败:', error);
						this.$message.error('网络错误，请稍后再试');
					});
			},
			select(row) {
				const userid = row.userId;
				this.$request.get(`/api/v1/healrecord/HealthRecord/${userid}`).then(res => {
					if (res.code === 200) {
						const allergyRecords = res.data; // 获取过敏史记录  

						// 创建一个用于展示过敏史的对话框内容  
						let allergyDialogContent = '';
						allergyRecords.forEach(record => { //使用forEach是假设有很多过敏史，但本项目中一个用户只会有一个过敏史
							allergyDialogContent += `${record.basicInfo}`;
						});

						// 创建对话框展示过敏史  
						this.$confirm(`过敏史信息如下：  
			      ${allergyDialogContent}`, '过敏史详情', {
							confirmButtonText: '确定',
							type: 'info'
						});
					} else {
						// 查询失败，展示错误消息  
						this.$message.error(res.msg || '查询过敏史时发生错误');
					}
				}).catch(error => {
					// 请求错误处理  
					console.error('查询过敏史时网络请求出错:', error);
					this.$message.error('查询过敏史时网络请求出错');
				});
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/prescription/allPrescriptionPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.prescription = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			formatDate(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "2024-05-15"
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