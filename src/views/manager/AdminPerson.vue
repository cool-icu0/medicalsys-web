<template>
	<div>
		<el-row :gutter="10">
			<el-col :span="12">
				<div class="grid-content">
					<el-card style="width: 100%">
						<el-form :model="user" label-width="100px" style="padding-right: 50px">
							<el-form-item label="用户ID" prop="userId">
								<el-input v-model="user.userId" placeholder="用户ID" disabled></el-input>
							</el-form-item>
							<el-form-item label="姓名" prop="username">
								<el-input v-model="user.username" placeholder="姓名"></el-input>
							</el-form-item>
							<el-form-item label="年龄" prop="age">
								<el-input v-model="user.age" placeholder="年龄"></el-input>
							</el-form-item>
							<el-form-item label="性别" prop="gender">
								<el-input :formatter="formatDateL" v-model="user.gender" placeholder="性别"></el-input>
							</el-form-item>
							<el-form-item label="生日" prop="birthday">
								<el-input :formatter="formatDateL" v-model="user.birthday" placeholder="生日"></el-input>
							</el-form-item>
							<el-form-item label="电话" prop="phone">
								<el-input v-model="user.phone" placeholder="电话"></el-input>
							</el-form-item>
							<el-form-item label="邮箱" prop="email">
								<el-input v-model="user.email" placeholder="邮箱"></el-input>
							</el-form-item>
							<el-form-item label="签名" prop="signature">
								<el-input v-model="user.signature" placeholder="签名"></el-input>
							</el-form-item>
							<div style="text-align: center; margin-bottom: 20px">
								<el-button type="primary" @click="update()">保 存</el-button>
							</div>
						</el-form>
					</el-card>
				</div>
			</el-col>
			<el-col :span="12">
				<div class="grid-content">
					<el-card style="width: 100%">
						<el-row>
							<el-col :span="12">
								<div class="grid-content">
									<el-row>
										<el-col :span="24">
											<div style="padding: 10px 0;">
												<h2>医保卡金额:</h2>
												<p style="margin-bottom: 10px; margin-top: 20px; font-weight: bold;">
													{{ cardPrices }}
												</p>
											</div>
										</el-col>
									</el-row>
								</div>
							</el-col>
							<el-col :span="12">
								<div class="grid-content">
									<el-row v-if="allergies.length > 0">
										<el-col :span="24">
											<div style="padding: 10px 0;">
												<h2>过敏史</h2>
												<ul>
													<li v-for="allergy in allergies" :key="allergy.id"
														style="margin-bottom: 10px; margin-top: 20px;  margin-left: 20px;font-weight: bold;">
														{{ allergy.basicInfo }}
													</li>
												</ul>
												<el-button type="primary"
													@click="dialogVisibleG = true">修改过敏史</el-button>
											</div>
										</el-col>
									</el-row>

									<el-row v-else>
										<el-col :span="24">
											<div style="padding: 10px 0;">暂无过敏史记录</div>
										</el-col>
									</el-row>
								</div>
							</el-col>
						</el-row>
						<hr />
						<el-row v-if="physicalCondition.length > 0">
							<el-col :span="24">
								<div style="padding: 10px 0;">
									<h2>体检信息</h2>
									<div v-for="condition in formattedPhysicalCondition" :key="condition.id"
										id="mediHistory-p">
										<span>体检日期:</span> {{ condition.checkupDate }}<br />
										<span>身高:</span> {{ condition.height }}cm<br />
										<span>体重:</span> {{ condition.weight }}kg<br />
										<span>血压:</span> {{ condition.bloodPressure }}<br />
										<span>心率:</span> {{ condition.heartRate }}次/分钟<br />
										<span>体温:</span> {{ condition.bodyTemperature }}°C<br />
										<span>症状:</span> {{ condition.symptoms }}<br />
										<span>诊断:</span> {{ condition.diagnosis }}
									</div>
								</div>
							</el-col>
						</el-row>

						<el-row v-else>
							<el-col :span="24">
								<div style="padding: 10px 0;">暂无体检记录</div>
							</el-col>
						</el-row>
						<el-row>
							<el-col :span="8"
								style="display: flex; justify-content: center; align-items: center; padding: 10px 0;">
								<el-button type="success" @click="dialogVisibleY = true">查询个人预约</el-button>
							</el-col>
							<el-col :span="8"
								style="display: flex; justify-content: center; align-items: center; padding: 10px 0;">
								<el-button type="success" @click="dialogVisible = true">查询个人订单</el-button>
							</el-col>
							<el-col :span="8"
								style="display: flex; justify-content: center; align-items: center; padding: 10px 0;">
								<el-button type="success" @click="drawerVisible = true">查询个人病例</el-button>
							</el-col>
						</el-row>

						<el-dialog title="个人订单" :visible.sync="dialogVisible" width="70%">
							<el-table :data="prescriptionCompute" style="width: 100%" @sort-change="handleSortChange">
								<el-table-column prop="id" label="处方ID" width="80"></el-table-column>
								<el-table-column prop="userId" label="用户ID" width="80"></el-table-column>
								<el-table-column prop="medicationGuide" label="处方"
									show-overflow-tooltip></el-table-column>
								<el-table-column :formatter="formatDateL" prop="createTime"
									label="申请时间"></el-table-column>
								<el-table-column prop="status" label="状态"></el-table-column>
								<el-table-column prop="price" label="处方金额"></el-table-column>
								<el-table-column label="操作" width="300" align="center">
									<template v-slot="scope">
										<el-button plain type="danger" size="mini"
											:disabled="scope.row.status =='未受理'?false:true"
											@click="deleteMedicine(scope.row)">取消</el-button>
										<el-button type="danger" size="mini" @click="Cost(scope.row)"
											:disabled="scope.row.status =='已受理'?false:true">支付宝支付</el-button>
										<el-button type="danger" size="mini" @click="CostY(scope.row)"
											:disabled="scope.row.status =='已受理'?false:true">医保卡支付</el-button>
									</template>
								</el-table-column>
							</el-table>
							<div class="pagination">
								<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
									:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next"
									:total="this.prescription.length">
								</el-pagination>
							</div>
						</el-dialog>
						<el-drawer :visible.sync="drawerVisible" size="30%" :with-header="true">
							<div v-if="caseHistory.length > 0" class="case-history-list">
								<h2>个人病例</h2>
								<div v-for="caseRecord in caseHistory" :key="caseRecord.id" class="case-record-card">
									<h4>{{ caseRecord.medicalCondition }}</h4>
									<p>医嘱: {{ caseRecord.treatment }}</p>
									<p>医生: {{ caseRecord.doctorName }}</p>
									<p>诊断日期: {{ formatDate(caseRecord.diagnosisDate) }}</p>
								</div>
							</div>
							<span v-else class="no-case-history">暂无病例记录</span>
						</el-drawer>
					</el-card>
				</div>
			</el-col>
		</el-row>
		<el-dialog title="修改过敏史" :visible.sync="dialogVisibleG" width="30%" @close="dialogVisibleG = false">
			<el-form :model="editAllergyForm" ref="editAllergyForm" label-width="120px">
				<el-form-item label="过敏史">
					<el-input v-model="editAllergyForm.basicInfo"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="dialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="updateAllergy">确 定</el-button>
			</span>
		</el-dialog>
		<el-dialog title="个人预约" :visible.sync="dialogVisibleY" width="50%">
			<el-table :data="appointCompute" style="width: 100%" @sort-change="handleSortChange">
				<el-table-column prop="id" label="预约单号" width="80"></el-table-column>
				<el-table-column prop="userId" label="用户ID" width="80"></el-table-column>
				<el-table-column prop="doctorId" label="医生ID" width="80"></el-table-column>
				<el-table-column prop="hospitalDepartment" label="科室"></el-table-column>
				<el-table-column :formatter="formatDateL" prop="appointmentDate" label="预约时间"></el-table-column>
				<el-table-column prop="appPrices" label="订单价格"></el-table-column>
				<el-table-column prop="isComplete" label="是否完成">
					<template v-slot="scope">
						<span>{{ scope.row.isComplete == 0 ? '未完成' : (scope.row.isComplete == 1 ? '已完成' : '已取消') }}</span>
					</template>
				</el-table-column>

				<el-table-column label="操作" align="center">
					<template v-slot="scope">
						<el-button plain type="danger" size="mini" @click="deleteAppoint(scope.row)"
							:disabled="scope.row.isComplete == 1?true:(scope.row.isComplete == 2 ? true:false )">取消</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next"
					:total="this.prescription.length">
				</el-pagination>
			</div>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "AdminPerson",
		data() {
			return {
				isLoading: true,
				pageNum: 1,
				pageSize: 8,
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				userId: JSON.parse(localStorage.getItem('xm-user') || '{}').userId,
				cardPrices: 0, // 医保卡金额   
				drawerVisible: false,
				dialogVisible: false,
				dialogVisibleG: false,
				dialogVisibleY: false,
				editAllergyForm: {},
				prescriptionPrices: {}, // 用于存储处方ID和对应的价格
				allergies: [], // 过敏史信息
				physicalCondition: [], // 体检信息
				caseHistory: [], // 病例信息
				prescription: [], //处方信息
				appoint: [], //预约信息
			}
		},
		created() {
			this.fetchData();
			this.fetchCaseHistory();
			this.fetchAppoint();
		},
		methods: {
			update() {
				const userData = {
					username: this.user.username,
					age: this.user.age,
					birthday: this.user.birthday,
					phone: this.user.phone,
					email: this.user.email,
					signature: this.user.signature,
					// avatar 需要更新，需要后端支持  
					// avatar: this.user.avatar  
				};
				// 保存当前的用户信息到数据库
				this.$request.post('/user/update', userData).then(res => {
					if (res.code == 200) {
						// 成功更新
						this.$message.success('保存成功')

						// 更新浏览器缓存里的用户信息
						localStorage.setItem('xm-user', JSON.stringify(this.user))

						// 触发父级的数据更新
						this.$emit('update:user')
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			// handleAvatarSuccess(response, file, fileList) {
			// 	// 把user的头像属性换成上传的图片的链接
			// 	this.$set(this.user, 'avatar', response.data)
			// },
			formatDate(dateString) {
				// 解析ISO格式的日期字符串  
				const date = new Date(dateString);
				// 格式化日期为YYYY-MM-DD格式  
				const formattedDate =
					`${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
				return formattedDate;
			},
			formatDateL(row, column) {
				const value = row[column.property];
				if (!value) return '';

				const date = new Date(value);
				const year = date.getFullYear();
				const month = (date.getMonth() + 1).toString().padStart(2, '0');
				const day = date.getDate().toString().padStart(2, '0');

				return `${year}-${month}-${day}`; // 返回 "xxxx-xx-xx"
			},
			fetchAppoint() {
				const userId = this.user.userId
				this.$request.get(`/api/v1/appoint/selectAppointmentRegistrationByUserId/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.appoint = res.data;
						}
					})
					.catch(error => {
						console.error('获取预约信息失败:', error);
					});
			},
			fetchData() {
				const userId = this.user.userId
				// 获取医保卡信息
				this.$request.get(`/api/v1/healCard/selectHealthCardByUserId/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.cardPrices = res.data[0].cardPrices;
						}
					})
					.catch(error => {
						console.error('获取医保卡信息失败:', error);
					});
				this.$request.get(`/api/v1/healrecord/HealthRecord/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.allergies = res.data;
						} else {
							console.error('获取过敏史信息失败:', res.msg);
						}
					})
					.catch(error => {
						console.error('获取过敏史信息时发生错误:', error);
					});
				this.$request.get(`/api/v1/phyCondition/selectPhysicalConditionByUserId/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.physicalCondition = res.data;
						} else {
							console.error('获取体检信息失败:', res.msg);
						}
					})
					.catch(error => {
						console.error('获取体检信息时发生错误:', error);
					});
				this.$request.get(`/api/v1/prescription/selectPrescriptionByUserId/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.prescription = res.data;
							// 异步获取每个处方的金额  
							Promise.all(this.prescription.map(prescription => this.getPrescriptionPrice(prescription
									.id)))
								.then(prices => {
									// 将获取金额附加到处方对象上  
									this.prescription.forEach((prescription, index) => {
										prescription.price = prices[index];
									});
								})
								.catch(error => {
									console.error('获取处方金额失败:', error);
								});
						}
					})
					.catch(error => {
						console.error('获取处方信息失败:', error);
					});
			},
			fetchCaseHistory() {
				const userId = this.user.userId
				this.$request.get(`/api/v1/mediHistory/selectMedicalHistoryByUserId/${userId}`)
					.then(res => {
						if (res.code == 200) {
							this.caseHistory = res.data;
						} else {
							console.error('获取病例信息失败:', res.msg);
						}
					})
					.catch(error => {
						console.error('获取病例信息时发生错误:', error);
					});
			},
			// 获取处方金额  
			getPrescriptionPrice(pid) {
				return new Promise((resolve, reject) => {
					this.$request.get(`/api/v1/preprices/selectPrescribepriceByPrescribeId/${pid}`)
						.then(res => {
							if (res.code == 200) {
								resolve(res.data.prices);
							} else {
								reject(res.msg);
							}
						})
						.catch(error => {
							reject(error);
						});
				});
			},
			handleCurrentChange(pageNum) {
				this.pageNum = pageNum
			},
			updateAllergy() {
				const allergyId = this.allergies[0].id;
				this.$request.post('/api/v1/healrecord/updateHealthRecord', {
					id: allergyId, // 过敏史id  
					basicInfo: this.editAllergyForm.basicInfo,
					userId: this.userId,
				}).then(res => {
					if (res.code == 200) {
						this.$message.success('过敏史修改成功');
						this.dialogVisibleG = false;
						this.fetchData();
						this.editAllergyForm = {}
					} else {
						this.$message.error(res.msg);
					}
				}).catch(error => {
					console.error('修改过敏史失败:', error);
				});
			},
			Cost(row) {
				let formCost = {}
				formCost.id = row.id
				formCost.url = "http://localhost:5173/adminPerson"
				window.location.href = "http://47.98.213.9:8039/api/v1/pay/toAliPay3?" + new URLSearchParams(
					formCost).toString()
				this.dialogVisible = false
			},
			CostY(row) {
				this.$request.get('/api/v1/prescription/healCardCharge?id=' + row.id).then(res => {
					if (res.code == 200) {
						this.$message.success('医保卡支付成功');
						this.dialogVisible = false;
						this.fetchData();
					} else {
						this.$message.error(res.msg);
					}
				})
			},
			deleteMedicine(row) {
				this.$request.get('/api/v1/prescription/unAuthorize', {
					params: {
						id: row.id,
						userid: row.userId
					}
				}).then(res => {
					this.$message.success('取消成功')
					this.fetchData()
				})
			},
			deleteAppoint(row) {
				let formAppoint = {}
				formAppoint.id = row.id
				formAppoint.userId = row.userId
				formAppoint.doctorId = row.doctorId
				formAppoint.appPrices = row.appPrices
				formAppoint.hospitalDepartment = row.hospitalDepartment
				formAppoint.appointmentDate = row.appointmentDate
				formAppoint.isComplete = row.isComplete
				this.$request.post('/api/v1/appoint/unAuthorize', formAppoint).then(res => {
					if (res.code == 200) {
						this.$message.success('取消成功')
						this.dialogVisibleY = false;
						this.fetchAppoint();
						this.fetchData();
					} else {
						this.$message.error(res.msg);
					}
				})
			},
		},
		computed: {
			formattedPhysicalCondition() {
				return this.physicalCondition.map(condition => ({
					...condition, // 复制原始对象  
					checkupDate: this.formatDate(condition.checkupDate) // 格式化日期  
				}));
			},
			prescriptionCompute() {
				//  end = start +(size-1)
				let start = (this.pageNum - 1) * this.pageSize
				let end = start + (this.pageSize - 1)
				return this.prescription.slice(start, end)
			},
			appointCompute() {
				//  end = start +(size-1)
				let start = (this.pageNum - 1) * this.pageSize
				let end = start + (this.pageSize - 1)
				return this.appoint.slice(start, end)

			}
		},
	}
</script>

<style scoped>
	/deep/.el-form-item__label {
		font-weight: bold;
	}

	/deep/.el-upload {
		border-radius: 50%;
	}

	/deep/.avatar-uploader .el-upload {
		border: 1px dashed #d9d9d9;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		border-radius: 50%;
	}

	/deep/.avatar-uploader .el-upload:hover {
		border-color: #409EFF;
	}

	.avatar-uploader-icon {
		font-size: 28px;
		color: #8c939d;
		width: 120px;
		height: 120px;
		line-height: 120px;
		text-align: center;
		border-radius: 50%;
	}

	.avatar {
		width: 120px;
		height: 120px;
		display: block;
		border-radius: 50%;
	}

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

	.row-bg {
		padding: 10px 0;
		background-color: #f9fafc;
	}

	.mediHistory-p {
		margin-bottom: 20px;
		margin-top: 20px;
	}

	#mediHistory-p span {
		font-weight: bold;
		font-size: 16px;
		margin-bottom: 5px;
	}

	.case-history-list {
		padding: 10px;
		/* 添加内边距 */
	}

	.case-record-card {
		margin-top: 10px;
		border: 1px solid #ddd;
		/* 添加边框 */
		border-radius: 4px;
		/* 添加圆角 */
		padding: 15px;
		/* 添加内边距 */
		margin-bottom: 10px;
		/* 添加间隔 */
		background-color: #fff;
		/* 可选：添加背景色 */
	}

	.no-case-history {
		padding: 10px;
		/* 添加内边距 */
		text-align: center;
		/* 文本居中显示 */
	}
</style>