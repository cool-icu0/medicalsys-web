<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入id查询" style="width: 200px; margin-right: 20px;" v-model="idSearchKey"></el-input>
			<el-input placeholder="请输入卡号查询" style="width: 200px" v-model="cardSearchKey"></el-input>
			<!-- <el-button type="info" plain style="margin-left: 10px" @click="load(1)">查询</el-button> -->
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<el-button type="primary" plain @click="handleAdd();">新增</el-button>
		</div>

		<div class="table">
			<el-table :data="medicareCardsCompute" strip @selection-change="handleSelectionChange" stripe>
				<!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
				<!-- <el-table-column type="index" label="序号" width="70" align="center" sortable></el-table-column> -->
				<el-table-column prop="cardId" label="序号"></el-table-column>
				<el-table-column prop="cardNumber" label="卡号" show-overflow-tooltip></el-table-column>
				<el-table-column prop="userId" label="持有用户Id"></el-table-column>
				<el-table-column prop="holderName" label="持有者姓名"></el-table-column>
				<el-table-column prop="expirationDate" label="过期时间"></el-table-column>
				<el-table-column prop="cardPrices" label="余额"></el-table-column>
				<!-- <el-table-column prop="isDelete" label="逻辑删除"></el-table-column> -->

				<el-table-column label="操作" align="center" width="180">
					<template v-slot="scope">
						<el-button size="mini" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
						<el-button size="mini" type="danger" plain @click="del(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>

			<div class="pagination">
				<el-pagination background @current-change="handleCurrentChange" :current-page="pageNum"
					:page-sizes="[5, 10, 20]" :page-size="pageSize" layout="total, prev, pager, next" :total="total">
				</el-pagination>
			</div>
		</div>


		<el-dialog title="管理员" :visible.sync="fromVisible" width="40%" :close-on-click-modal="false" destroy-on-close>
			<el-form :model="form" label-width="100px" style="padding-right: 50px" :rules="rules" ref="formRef">
				<el-form-item label="姓名" prop="holderName">
					<el-input v-model="form.holderName" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item label="持卡人ID" prop="userId">
					<el-input v-model="form.userId" placeholder="持卡人ID"></el-input>
				</el-form-item>
				<el-form-item label="卡号" prop="cardNumber">
					<el-input v-model="form.cardNumber" placeholder="卡号"></el-input>
				</el-form-item>
				<el-form-item label="金额" prop="cardPrices">
					<el-input v-model="form.cardPrices" placeholder="金额"></el-input>
				</el-form-item>
				<el-form-item label="到期时间" prop="expirationDate">
					<el-date-picker v-model="form.expirationDate" type="date" placeholder="选择到期时间">
					</el-date-picker>
				</el-form-item>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="fromVisible = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>


	</div>
</template>

<script>
	export default {
		name: "Doctor",
		data() {
			var validateCardNumber = (rule, value, callback) => {
				if (value === '') {
					callback(new Error('卡号不能为空'));
				} else if (value.length !== 11) {
					callback(new Error('卡号必须是11位数'));
				} else {
					callback();
				}
			};
			return {
				idSearchKey: '',
				cardSearchKey: '',
				tableData: [], // 所有的数据
				pageNum: 1, // 当前的页码
				pageSize: 8, // 每页显示的个数
				total: 0,
				username: null,
				fromVisible: false,
				value4: 1,
				form: {},
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				rules: {
					form: {
						holderName: '',
						userId: '',
						cardNumber: '',
						cardPrices: '',
						expirationDate: ''
					},
					rules: {
						holderName: [{
							required: true,
							message: '姓名不能为空',
							trigger: 'blur'
						}],
						userId: [{
							required: true,
							message: '持卡人ID不能为空',
							trigger: 'blur'
						}],
						cardNumber: [{
							required: true,
							validator: validateCardNumber,
							trigger: 'blur'
						}],
						cardPrices: [{
							required: true,
							message: '金额不能为空',
							trigger: 'blur'
						}],
						expirationDate: [{
							required: true,
							message: '到期时间不能为空',
							trigger: 'change'
						}]
					}
				},
				ids: [],
				departmentData: [],
				options: [{
					value: 1,
					label: '医生'
				}],
			}
		},
		mounted() {
			this.fetchmedicareCards();
		},
		computed: {
			medicareCardsCompute: function() {
				console.log(this.tableData)
				if (this.tableData.length > 0) {
					return this.tableData.filter(item => {
							return item.cardNumber.includes(this.cardSearchKey)
						})
						.filter(item => {
							return ("" + item.userId).includes(this.idSearchKey)
						})
				} else {
					return []
				}
			}
		},
		methods: {
			fetchmedicareCards() {
				this.$request.get(`/api/v1/healCard/allHealthCardPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`)
					.then(res => {
						console.log(res);
						this.tableData = res.data?.list
						this.total = res.data?.total
					})
			},
			loadDepartment() {
				this.$request.get('/api/v1/department/selectAllDepartment').then(res => {
					console.log(res)
					if (res.code == 200) {
						this.departmentData = res.data
					} else {
						this.$message.error(res.msg)
					}
				})
			},
			handleAdd() {
				this.form = {}
				this.fromVisible = true
			},
			handleEdit(row) { // 编辑数据
				this.form = JSON.parse(JSON.stringify(row)) // 给form对象赋值  注意要深拷贝数据
				this.fromVisible = true // 打开弹窗
			},
			save() { // 保存按钮触发的逻辑  它会触发新增或者更新
				// this.$refs.formRef.validate((valid) => {
				// 	if (valid) {
				this.$request({
					url: this.form.cardId ? '/api/v1/healCard/updateHealthCard' :
						'/api/v1/healCard/insertHealthCard',
					method: 'POST',
					data: this.form
				}).then(res => {
					if (res.code == 200) { // 表示成功保存
						this.$message.success('保存成功')
						this.fetchmedicareCards()
						this.fromVisible = false
					} else {
						this.$message.error(res.msg) // 弹出错误的信息
					}
				})
				// 	}
				// })
			},
			del(id) { // 单个删除
				this.$confirm('您确定删除吗？', '确认删除', {
					type: "warning"
				}).then(response => {
					this.$request.post('/api/v1/doctor/deleteDoctorInfo/' + id).then(res => {
						if (res.code == 200) { // 表示操作成功
							this.$message.success('操作成功')
							this.load(1)
						} else {
							this.$message.error(res.msg) // 弹出错误的信息
						}
					})
				}).catch(() => {})
			},
			handleSelectionChange(rows) { // 当前选中的所有的行数据
				this.ids = rows.map(v => v.id)
			},
			reset() {
				this.idSearchKey = '';
				this.cardSearchKey = '';
			},
			load(pageNum) { // 分页查询
				if (pageNum) this.pageNum = pageNum
				this.$request.get('/api/v1/healCard/allHealthCardPager2', {
					params: {
						pageNum: this.pageNum,
						pageSize: this.pageSize,
					}
				}).then(res => {
					this.tableData = res.data?.list
					this.total = res.data?.total
				})
			},
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			handleAvatarSuccess(response, file, fileList) {
				// 把头像属性换成上传的图片的链接
				this.form.avatar = response.data
			},
		}
	}
</script>

<style scoped>

</style>