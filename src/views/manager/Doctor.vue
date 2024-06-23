<template>
	<div>
		<div class="search">
			<el-input placeholder="请输入姓名查询" style="width: 200px; margin-right: 20px;"
				v-model="nameSearchKey"></el-input>
			<el-input placeholder="请输入科室查询" style="width: 200px" v-model="departmentSearchKey"></el-input>
			<el-button type="warning" plain style="margin-left: 10px" @click="reset">重置</el-button>
			<el-button type="primary" plain @click="handleAdd();">新增</el-button>
		</div>

		<div class="table">
			<el-table :data="doctorsCompute" strip @selection-change="handleSelectionChange" stripe>
				<!-- <el-table-column type="selection" width="55" align="center"></el-table-column> -->
				<el-table-column prop="id" label="序号" width="70" align="center" sortable></el-table-column>
				<el-table-column prop="imgUrl" label="照片" width="120">
					<template v-slot:default="scope">
						<div style="text-align: center; width: 120px;">
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
				<!-- <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item> -->
				<el-form-item label="姓名" prop="doctorName">
					<el-input v-model="form.doctorName" placeholder="姓名"></el-input>
				</el-form-item>
				<el-form-item label="特长" prop="specialty">
					<el-input v-model="form.specialty" placeholder="特长"></el-input>
				</el-form-item>
				<el-form-item label="所属医院" prop="hospitalName">
					<el-input v-model="form.hospitalName" placeholder="所属医院"></el-input>
				</el-form-item>
				<el-form-item label="科室" prop="department">
					<el-select v-model="form.department" placeholder="请选择科室" style="width: 100%">
						<el-option v-for="item in departmentData" :key="item.id" :label="item.departmentName"
							:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="职位" prop="position">
					<el-input v-model="form.position" placeholder="职位"></el-input>
				</el-form-item>
				<el-form-item label="任职时长(年)" prop="experienceYears">
					<el-input v-model="form.experienceYears" placeholder="任职时长"></el-input>
					<div class="block">
						<el-slider v-model="form.experienceYears" :step="1" show-input></el-slider>
					</div>
				</el-form-item>
				<el-form-item label="介绍" prop="introduction">
					<el-input type="textarea" :rows="4" v-model="form.introduction" placeholder="医生介绍"></el-input>
				</el-form-item>
				<el-row>
					<el-col :span="9">
						<div>
							<el-form-item label="角色" prop="role">
								<el-select v-model="form.role" clearable placeholder="请选择">
									<el-option v-for="item in options" :key="item.value" :label="item.label"
										:value="item.value">
									</el-option>
								</el-select>
							</el-form-item>
						</div>
					</el-col>
					<el-col :span="15">
						<div>
							<el-form-item prop="imgUrl" label="照片">
								<!-- 
							:auto-upload="false" 表示文件选择后不自动上传，等待用户点击上传按钮。
							:before-upload="beforeUpload" 是一个钩子，在文件上传之前调用，用于文件类型和大小的校验。
							:on-success="handleUploadSuccess" 是一个钩子，在文件上传成功时调用，用于处理服务器返回的响应。
							-->
								<el-upload ref="upload" class="avatar-uploader"
									action="http://localhost:8039/api/v1/file/updateDoctorInfo"
									:before-upload="beforeUpload" :on-success="handleUploadSuccess"
									:show-file-list="false" :auto-upload="false">
									<img v-if="form.imgUrl" :src="form.imgUrl" alt="照片"
										style="width: 100px; height: auto;">
									<i v-else class="el-icon-plus avatar-uploader-icon"></i>
									<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
								</el-upload>
							</el-form-item>
						</div>
					</el-col>
				</el-row>
			</el-form>

			<div slot="footer" class="dialog-footer">
				<el-button @click="fromVisible = false">取 消</el-button>
				<el-button type="primary" @click="save">确 定</el-button>
			</div>
		</el-dialog>


	</div>
</template>

<script>
	import axios from 'axios'
	export default {
		name: "Doctor",
		data() {
			return {
				nameSearchKey: '',
				departmentSearchKey: '',
				tableData: [], // 所有的数据
				pageNum: 1, // 当前的页码
				pageSize: 10, // 每页显示的个数
				total: 0,
				username: null,
				fromVisible: false,
				value4: 1,
				form: {},
				user: JSON.parse(localStorage.getItem('xm-user') || '{}'),
				rules: {
					username: [{
						required: true,
						message: '请输入账号',
						trigger: 'blur'
					}, ]
				},
				ids: [],
				departmentData: [],
				options: [{
						value: 1,
						label: '医生',
					},
					{
						value: 2,
						label: '药剂师'
					}
				],
			}
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
			}
		},
		mounted() {
			this.fetchDoctors();
			this.loadDepartment()
		},
		methods: {
			fetchDoctors() {
				this.$request.get(
						`/api/v1/doctor/allDoctorInfoPager2?pageNum=${this.pageNum}&pageSize=${this.pageSize}`
					)
					.then(res => {
						this.tableData = res.data.list
						this.total = res.data.total
					})
			},
			loadDepartment() {
				this.$request.get('/api/v1/department/selectAllDepartment').then(res => {
					if (res.code == 200) {
						this.departmentData = res.data
						console.log(this.departmentData)
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
				this.fromVisible = true
			},
			save() {
				// this.$refs.formRef.validate((valid) => {
				//   if (valid) {
				let formData = new FormData();

				// 添加其他医生信息到formData中  
				if (this.form.id) {
					formData.append('id', this.form.id); // 只有当编辑现有记录时才需要id  
				}
				formData.append('department', this.form.department);
				formData.append('doctorName', this.form.doctorName);
				formData.append('experienceYears', this.form.experienceYears);
				formData.append('hospitalName', this.form.hospitalName);
				formData.append('introduction', this.form.introduction);
				formData.append('role', this.form.role);
				formData.append('specialty', this.form.specialty);
				formData.append('position', this.form.position);
				// 检查是否有文件被选中  
				if (this.$refs.upload && this.$refs.upload.uploadFiles && this.$refs.upload.uploadFiles
					.length > 0) {
					// 有文件被选中，则添加到formData中  
					formData.append('file', this.$refs.upload.uploadFiles[0].raw); // 后端接收的字段名为'file'  
				} else {
					formData.append('imgUrl', this.form.imgUrl);
				}
				axios.post(
					this.form.id ? 'http://localhost:8039/api/v1/file/updateDoctorInfo' :
					'http://localhost:8039/api/v1/file/insertDoctor', formData, {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					}).then(res => {
					if (res.data.code == 200) { // 表示成功保存
						this.$message.success('保存成功')
						this.fetchDoctors();
						this.fromVisible = false
					} else {
						this.$message.error(res.msg) // 弹出错误的信息
					}
				});
				//   }
				// })
			},
			del(id) { // 单个删除
				this.$confirm('您确定删除吗？', '确认删除', {
					type: "warning"
				}).then(response => {
					this.$request.post('/api/v1/doctor/deleteDoctorInfo/' + id).then(res => {
						if (res.code == 200) { // 表示操作成功
							this.$message.success('操作成功')
							this.fetchDoctors()
						} else {
							this.$message.error(res.msg) // 弹出错误的信息
						}
					})
				}).catch(() => {})
			},
			handleSelectionChange(rows) { // 当前选中的所有的行数据
				this.ids = rows.map(v => v.id)
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
			handleCurrentChange(pageNum) {
				this.load(pageNum)
			},
			reset() {
				this.nameSearchKey = ''
				this.departmentSearchKey = ''
			},
			// handleAvatarSuccess(response, file, fileList) {
			// 	// 把头像属性换成上传的图片的链接
			// 	this.form.avatar = response.data
			// },
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

		}
	}
</script>

<style scoped>

</style>